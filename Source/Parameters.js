
import Language from './Enums/Language.js'


const { entries } = Object;


const toggle = ( parameter ) =>
    ( state ) => {
        if(state)
            return parameter;
    }

const pack = ( stringOrArray ) =>
    [ stringOrArray ].flat(1);


const Parameters = entries({

    language : language ,

    stopAtStage : stopAtStage ,

    outputPath : outputPath ,

    dumps : dumps ,

    verbose : toggle('-v') ,

    playPretend : toggle('-###') ,

    targetHelp : toggle('--target-help') ,

    help : help ,

    displayVersion : toggle('--version') ,

    passErrorCode : toggle('-pass-exit-codes') ,

    usePipes : toggle('-pipe') ,

    specificationPath : specificationPath ,

    wrapWith : wrapWith ,

    filePrefixMap : filePrefixMap ,

    plugins : plugins ,

    generateAdaSpec : generateAdaSpec ,

    generateGoSpec : generateGoSpec ,

    parametersPath : parametersPath ,

})


/**
 *  @brief Determine parameters from the given options.
 */

export default function ( options ){

    const parameters = [];

    for(const parameter of collectParameters(options))
        if(parameter)
            parameters.push( ... pack(parameter) );

    return parameters
}


/**
 *  @brief Try to determine parameter values.
 */

function * collectParameters ( options ){

    for(const [ name , preprocessor ] of Parameters)
        if(name in options)
            yield preprocessor(options[name]);
}




function language ( type ){

    const language = Language[type];

    if(language)
        return `-x ${ language }`

    throw `Unknown language specifier: ${ type }`
}


function stopAtStage ( stage ){

    if(stage)
        switch ( stage ){
        case 'Compilation' : return '-E'
        case 'Assemble'    : return '-S'
        case 'Linking'     : return '-c'
        default:
            throw `Unknown stage to stop processing at: ${ stage }`
        }
}


function outputPath ( path ){
    return `-o ${ path }`
}

function specificationPath ( path ){
    return `-specs=${ path }`
}

function parametersPath ( path ){
    return `@${ path }`
}


function dumps ( options ){

    const parameters = [];

    if('fileName' in options)
        parameters.push(`-dumbbase ${ options.fileName }`);

    if('extension' in options)
        parameters.push(`-dumpbase-ext ${ options.extension }`);

    if('directory' in options)
        parameters.push(`-dumpdir ${ options.directory }`);

    return parameters;
}


const { isArray } = Array;


function help ( options ){

    if(options === true)
        return '--help'

    if(!isArray(options))
        options = [ options ];

    return options.map((options) => {

        const { categories = [] , category } = options;

        if(category)
            categories = [ category ];

        const specifiers = categories;

        if('undocumented' in options)
            specifiers.push(
                (options.undocumented ? '' : '^') +
                'undocumented');

        if('joined' in options)
            specifiers.push(
                (options.joined ? '' : '^') +
                'joined');

        if('separate' in options)
            specifiers.push(
                (options.separate ? '' : '^') +
                'separate');


        return `--help=${ specifiers.join(',') }`
    })
}


function wrapWith ( options ){

    if('command' in options){

        const { command , parameters = [] } = options;

        return `-wrapper ${ [ command , ... parameters ].join(',') }`
    }

    throw 'Cannot wrap gcc without specifying a command.'
}


function filePrefixMap ( options ){

    const { from , to } = options;

    if(from && to)
        return `-ffile-prefix-map=${ from }=${ to }`

    throw `Cannot use prefix maps without both 'from' & 'to'.`
}


import { parse }
from 'https://deno.land/std@0.159.0/path/mod.ts';


function plugins ( plugins ){

    const parameters = [];

    for(const plugin of plugins){

        const { path } = plugin;

        if(!path)
            throw 'You need to specify a path for plugin'

        parameters.push(`-fplugin=${ path }`);

        const { name } = parse(path);

        for(const [ key , value ] of entries(plugin.data ?? {}))
            parameters.push(`-fplugin-arg-${ name }-${ key }=${ value }`);
    }

    return parameters
}


function generateAdaSpec ( options ){

    const parameters = [];


    const { type } = options;

    switch ( type ){
    case 'normal' : parameters.push('-fdump-ada-spec');      break ;
    case 'slim'   : parameters.push('-fdump-ada-spec-slim'); break ;
    default:
        throw `Unknown Ada Spec generation type: ${ type }`
    }

    const { parent } = options;

    if(parent)
        parameters.push(`-fada-spec-parent=${ parent }`);

    return parameters
}


function generateGoSpec ( path ){
    return `-fdump-go-spec=${ path }`
}
