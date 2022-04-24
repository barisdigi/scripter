# Scripter

Scripter is a basic prototype for a turn based scripting game similar to Screeps. It was mostly made to test vm2 sandboxing capabilities and should not be considered final. The project can work on multiple servers and multiple cores using NodeJS subprocesses. Communication between processes is done using Redis. 

Every turn works in two phases, in phase one, processes get their tasks from Redis and for each action creates an Intent. In phase two, these intents are processed to make sure they are valid and changes are inserted to a MongoDB database in bulk.

The main problem with this approach is limited sandboxing capabilities of vm2 module. There are some cases where timing out script executions are impossible. 
