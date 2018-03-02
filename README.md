Ansible LDAP inventory
----------------------
This script can be used to use LDAP as a source for your Ansible inventory.
It is currently under development and available here for people who want to
do something similar. Expect more updates later on.

Included is an LDIF export so you can get an idea of the LDAP structure.

- All hosts are contained in a OU (ex hosts)
- groups need to be groupOfNames
- you can have a group inside a group. These wil be listed as children
- The directory is extended with a custom schema created by @jpmens. The file
  is included as ansible.schema.

Added a JS variaent as I understand Node better
example output
--------------

--list :
[bash]
```
→ ~/projects/ansible-ldap/inventory.py --list
```
NOTE: children and vars are not impleneted yet but will be
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
      "webservers"
    ], 
    "hosts": [
      "host01", 
      "host02"
    ], 
    "vars": {
      "ansible_ssh_port": "222", 
      "jboss": "8080", 
      "ssh_port": "222"
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
