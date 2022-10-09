
const { errors , run } = Deno;
const { NotFound } = errors;


export default async function ( options ){
    
    const { 
        workingDirectory = null , 
        returnErrors = false ,
        returnOutput = false ,
        parameters = []
    } = options;
    
    try {
        
        const config = {
            stdout : 'null' ,
            stderr : 'null' ,
            cwd : workingDirectory ,
            cmd : [ 'gcc' , ... parameters ]
        }
        
        if(returnErrors)
            config.stderr = 'piped';
            
        if(returnOutput)
            config.stdout = 'piped';
        
        const process = await run(config);
        
        
        const { success , code } = await process.status();
        
        if(!success)
            throw new Error(`GCC encountered a fatal error. Code: ${ code }`);
            
        const data = {}
        
        if(returnErrors)
            data.errors = new TextDecoder()
                .decode(await process.stderrOutput());
                
        if(returnOutput)
            data.output = new TextDecoder()
                .decode(await process.output());
        
        return data;
        
    } catch ( error ) {
        
        if(error instanceof NotFound)
            error = new NotFound('GCC executable is missing.');
            
        throw error
    }
}