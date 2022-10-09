
import run from './Run.js'


/**
 *  @brief Return the gcc version string 
 *  which includes the system version.
 */

export async function versionString (){
    
    const { output } = await run ({
        parameters : [ '--version' ] ,
        returnOutput : true ,
    })
    
    return output.split('\n')[0];
}


/**
 *  @brief Return the gcc version.
 */

export async function version (){
    return (await versionString())
        .split(' ')
        .pop();
}