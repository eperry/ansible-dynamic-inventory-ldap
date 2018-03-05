module.exports = {
	name:"Custom LDAP Matcher",
	generateGroups: function (entry){
		var groups = []
		var siteMap = { 
			"1" : "NYCATT",
			"2" : "NYCATT",
			"3" : "JXN",
			"4" : "PhillySunGard",
			"5" : "Amazon"
			}
		var envMap = {
			"p" : "prod",
			"r" : "prev",
			"q" : "qa",
			"d" : "dev",
			"c" : "ci",
		}
		var appMap = {
			"xx" : "BlueMartini",
			"utl" : "Utility",
			"wb"  : "WebServer",
			"web" : "WebServer",
			"ng"  : "Nagios",
			"vs"  : "VSphere",
			"rc"  : "Oracle"
		}
		// Check to see if the LDAP Attribute operatingSystem is set
		// Else set it to linux
 		if ( typeof entry.operatingSystem === "undefined" ){
                        entry.operatingSystem="linux"
                }
		groups.push(entry.operatingSystem)
		var result = entry.cn.match(/(.{2})(\d)(\w)(\D+)/);
		if ( result ){
			// Push site
	                if (typeof siteMap[result[2]] !== "undefined" ) groups.push(siteMap[result[2]])
			// Push enviroment
			if (typeof envMap[result[3]] !== "undefined"  ) groups.push(envMap[result[3]])
			// Push application
			if (typeof appMap[result[4]] !== "undefined"  ) groups.push(appMap[result[4]])
		}
		return groups;
	}
}
