import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';
const output=await mkdtemp(join(tmpdir(),'junto-java-'));
try{execFileSync('java',['com.sun.tools.javac.Main','-d',output,'android/app/src/main/java/br/com/junto/app/BankNotificationParser.java','tests/BankParserChecks.java'],{stdio:'inherit'});execFileSync('java',['-cp',output,'BankParserChecks'],{stdio:'inherit'});}finally{await rm(output,{recursive:true,force:true});}
