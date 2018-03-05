Ansible LDAP inventory
----------------------
This script can be used to use LDAP as a source for your Ansible inventory.
It is currently under development and available here for people who want to
do something similar. Expect more updates later on.

The way I have organized this.

* Create a OU in your tree with called AnsibleRoles. In this OU Any Group defined here will be used by this script to define server roles.  Just add a server to this "role" and it will be dynamically used in the output

* update the ldap_inventory.config with this OU DN

* Right now I don't support varibles, but I will probably load them from a directory. I am trying to prevent too many configurations in AD
* also, I have created a lib CustomMatch.js  this creates groups based on the hostname. Our old standard would define the department, colocation site, QA|PRD|... , app name, instance and operating system all in the hostname. For better or worse I am supporting that syntax
* Don't support children yet either.


example output
--------------
* Config file ldap_inv.js.config  can be located in /etc/ansible/ $HOME/.ansible config or $PWD

[bash]
```
~/ansible-dynamic-inventory/ldap_inv.js --list
```

```
{
  "infrasrv": {
    "children": [], 
    "hosts": [
      "infra-03.prod.btr.local"
    ], 
    "vars": {}
  }, 
  "proxyservers": {
    "children": [
    ], 
    "hosts": [
      "host01", 
      "host02"
    ], 
    "vars": {
    }
  }, 
  "webservers": {
    "children": [], 
    "hosts": [
      "host02", 
      "web01", 
      "web03"
    ], 
    "vars": {}
  }
}
```
