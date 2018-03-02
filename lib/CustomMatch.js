module.exports = {
	name:"HBC Custom LDAP Matcher",
	generateGroups: function (entry){
		var groups = []
		var siteMap = { 
			"1" : "NYC ATT",
			"2" : "NYC ATT",
			"3" : "JXN",
			"4" : "Philly SunGard",
			"5" : "Amazon"
			}
		var envMap = {
			"p" : "Production",
			"r" : "Preview",
			"q" : "QA",
			"d" : "Development",
			"c" : "ContiousIntegration",
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
	                //if (typeof siteMap[result[2]] !== "undefined" ) groups.push(siteMap[result[2]])
			// Push enviroment
			//if (typeof envMap[result[3]] !== "undefined"  ) groups.push(envMap[result[3]])
			// Push application
			if (typeof appMap[result[4]] !== "undefined"  ) groups.push(appMap[result[4]])
		}
		return groups;
	}
}