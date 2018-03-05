#!/usr/bin/env node
var path = require('path');
var Logger = require('bunyan');
var fs = require('fs');
var inventory_list= { "_meta" : { 'hostvars': {} }}
var ldap_list = []
var group_names={'ungrouped':'ungrouped' }

function checkPath(pathlist,file){
	var p="";
	for(i = 0; i < pathlist.length; i++) {
		if(fs.existsSync(pathlist[i]) 
			&& fs.existsSync(pathlist[i]+"/"+file)){
			//console.log(pathlist[i]+"/"+file);
			return pathlist[i]+"/"+file;
		}
	}
	return false;
}
function addHostGroup (host,groupdn){
}

// -------------------------------
// Load Library for custom matcher
// -------------------------------
var customMatch = require(__dirname+"/lib/CustomMatch.js")
// -------------------------------
// Load Config
// -------------------------------
var config_filename = path.basename(__filename) + ".config"
var config_path = checkPath(['/etc/ansible',
			      process.env.HOME+"/.ansible",
			     './config',
			     '.'], config_filename );
if ( config_path === false ) {
	process.stderr.write("config file $config_filename not found in config path");
	process.stdout.write(JSON.stringify(inventory_list,undefined, 2))
}
var config = JSON.parse(fs.readFileSync(config_path, 'utf8'));
if (config.default_logfile === undefined ) config['default_logfile'] = __filename+".log"
var LOG = new Logger({
  name: 'ldapjs',
  component: 'client',
  streams: [{
	level: "error",
        path: config.default_logfile,
	}],
  serializers: Logger.stdSerializers,
});
var ldap_opts = {
  //filter: '(&(l=Seattle)(email=*@foo.com))',
  scope: 'sub',
  attributes: ['cn',"memberof","operatingSystem"]
};
function addGroupMap(entry){
	group_names[entry.dn]=entry.cn
}
function addToLdapList(entry){
	ldap_list.push(entry);
}
function addToInventoryList(entry){
                if (typeof entry.memberOf === "undefined" ){
			entry.memberOf=["ungrouped"]
		}
		if ( typeof entry.memberOf == "string" ){
			entry.memberOf = [ entry.memberOf ]
		}
		if (entry.cn.match(/computers/i)){ return;}
		// -----------------------------------------
		// --- If the server is part of an AnsibleRole OU then add this host to that group too
		// -----------------------------------------
		//console.log(entry)
		entry["memberOf"].forEach(function(m){
			m= group_names[m]
			if ( typeof inventory_list[m] === 'undefined'){
				inventory_list[m]={}
				inventory_list[m].hosts=[]
				inventory_list[m].children=[]
				inventory_list[m].vars={}
			}
			inventory_list[m].hosts.push(entry.cn)
		})
		// -----------------------------------------
		// --- Parse the host name with a custom parser
		// -----------------------------------------
		var clist = customMatch.generateGroups(entry)
                if (typeof clist !== "undefined" ){
			clist.forEach(function(m){
				if ( typeof inventory_list[m] === 'undefined'){
					inventory_list[m]={}
					inventory_list[m].hosts=[]
					inventory_list[m].children=[]
					inventory_list[m].vars={}
				}
				inventory_list[m].hosts.push(entry.cn)
			})
		}
		
}

function search(dn,cb){
	return new Promise(function(resolve, reject) {
		if ( dn === "ungrouped"){
			resolve("ungrouped")
		}
		var queue=[]
		var ldap = require('ldapjs');
		var client = ldap.createClient({
		  url: config.url,
		  log:LOG,
		  tlsOptions:{
			rejectUnauthorized: false
		  }
		});
		client.bind(config.bind_username, config.bind_password, function(err) {
		  if(err) {
			reject(err);
		  }
		});
		//console.log("search dn"+dn)
		client.search(dn, ldap_opts, function(err, res) {
		  if (err) reject(err);
		  res.on('searchEntry', function(entry) {
		    if( typeof cb === 'undefined' ){
			    queue.push(entry.object);
		    }else{
			    cb(entry.object)
		    }
		  });
		  res.on('searchReference', function(referral) {
		    //console.log('referral: ' + referral.message);
		  });
		  res.on('error', function(err) {
			client.unbind(function(err) {
				reject(err)
			})
		    reject('error: ' + err.message);
		  });
		  res.on('end', function(result) {
			client.unbind(function(err) {
				reject(err)
			})
			if( typeof cb === undefined ){
				resolve(queue);
			}else{
				resolve([])
			}
		  });
	     });
	})
}
if (process.argv[2] == "--list"){
Promise.all([
	search(config.search_cn,addToLdapList),
	search(config.ansible_ou,addGroupMap)
	])
.then(function(result){
	ldap_list.forEach(function (entry){
		addToInventoryList(entry);
	})
} ,function(err){
})
.then(function(result){
	process.stdout.write(JSON.stringify(inventory_list,undefined, 2))
} ,function(err){
})
process.on('uncaughtException', function(err) {
    LOG.error(JSON.stringify(err));
    console.log(JSON.stringify(inventory_list,undefined, 2))
});}


