/*
* Author   Jonathan Lurie - http://me.jonahanlurie.fr
* License  MIT
* Link      https://github.com/jonathanlurie/pixpipejs
* Lab       MCIN - Montreal Neurological Institute
*/

import { PipelineElement } from './PipelineElement.js';
//import { Pipeline } from './Pipeline.js';


/**
* Filter is a base class and must be inherited to be used properly.
* A filter takes one or more Image instances as input and returns one or more
* instances of images as output.
* Every filter has a addInput(), a getOutput() and a update() methods.
* Every input and output can be arranged by category, so that internaly, a filter
* can use and output diferent kind of data.
*/
class Filter extends PipelineElement {

  constructor(){
    super();
    this._type = Filter.TYPE();

    // a bunch of event to be defined. Empty by default.
    this._events = {};

    this._inputValidator = {};

    this._input = {
      //"0": []
    };

    this._output = {
      //"0" : []
    };

    this._isOutputReady = false;

  }


  /**
  * Hardcode the datatype
  */
  static TYPE(){
    return "FILTER";
  }


  /**
  * Set an input, potentially associated to a category.
  * @param {Image2D} inputObject - most likely an instance of Image2D but can also be HTML5 File or Image3D
  * @param {Number} category - in case we want to get data from diferent categories.
  */
  addInput( inputObject, category=0){

    // the category may not exist, we create it
    if( !(category in this._input) ){
      this._input[category] = null;
    }

    this._input[category] = inputObject ;

    // add the pipeline object if defined
    if( this._pipeline ){
      inputObject.setPipeline( this._pipeline );
    }

    this._isOutputReady = false;
  }


  /**
  * Return outputs from a category (default category: 0)
  * @param {Number} category - a category of output.
  * @return {Object} or null if no output can be returned.
  */
  getOutput( category=0 ){
    if( category in this._output ){
      return this._output[ category ];
    }else{
      return null;
    }
  }


  /**
  * [PRIVATE]
  * Internal way to setup an output for this filter. Acts like a singleton in a sens
  * that if an output of a given category was already Initialized, it returns it.
  * If no input was Initialized, it creates one. Then we are sure the pointer of the
  * output remain the same and does not break the pipeline.
  * @param {type} dataType - type of object, i.e. Image2D (this is NOT a String!)
  * @param {Number} category - in case we want to get data from different categories.
  * @returns {Object} of given type.
  */
  _addOutput( dataType, category=0 ){
    var outputObject = null;

    // the category may not exist, we create it
    if( !(category in this._output) ){
      var outputObject = new dataType();
      this._output[category] = outputObject;

      //console.log(this._output);
      console.log("filter " + this.constructor.name + " creates a new output.");
      /*
      if(this._pipeline){
        outputObject.setPipeline( p );
      }
      */

    }else{
      // TODO: if output object exists but is not from dataType: error!
      //outputObject = this._output[category];
      console.warn("An output of category " + category + " was already defined.");
    }

    //return outputObject;
  }


  /**
  * [PRIVATE]
  * should noly be used by the class that inherit Filter.
  * @param {Number} category - in case we want to get data from different categories.
  * @return {Object} or null if no input can be returned
  */
  _getInput( category=0 ){
    if( category in this._input ){
      return this._input[ category ];
    }else{
      return null;
    }
  }


  /**
  * Same as PixpipeObject.setMetadata but add the _isOutputReady to false.
  */
  setMetadata( key, value ){
    super.setMetadata( key, value );
    this._isOutputReady = false;
  }



  hasOutputReady(){
    return this._isOutputReady;
  }


  setOutputAsReady(){
    this._isOutputReady = true;
  }

  /**
  * Validate the input data using a model defined in _inputValidator.
  * Every class that implement Filter must implement their own _inputValidator.
  * Not mandatory to use, still a good practice.
  */
  hasValidInput(){
    var that = this;
    var inputCategories = Object.keys( this._inputValidator );
    var valid = true;

    inputCategories.forEach( function(key){
      valid = valid && that._getInput( key ).isOfType( that._inputValidator[ key ] )
    });

    if(!valid){
      console.warn("The input is not valid.");
    }

    return valid;
  }


  /**
  * MUST be implemented by the class that inherit this.
  * Launch the process.
  */
  update(){
    console.error("The update() method has not been written, this filter is not valid.");
  }


  /**
  * Defines a callback. By defautl, no callback is called.
  */
  on(eventId, callback){
    this._events[ eventId ] = callback;
  }


  /**
  * Associate a Pipeline instance to this filter. Not supposed to be called manually
  * because it is automatically called-back when adding a filter to a pipeline.
  * @param {Pipeline} p - Pipeline object.
  */
  setPipeline( p ){
    /*
    // only if not already set.
    if(!this._pipeline){
      this._pipeline = p;

      // set the pipeline to all input so that they can update the entire
      // pipeline in case of modification
      var inputCategories = Object.keys( this._inputValidator );
      inputCategories.forEach( function(key){
        widths.push( that._getInput( key ).setPipeline( p ) );
      });

    }
    */
    super.setPipeline( p );

    var inputCategories = Object.keys( this._input );
    inputCategories.forEach( function(key){
      that._getInput( key ).setPipeline( p );
    });


    var outputCategories = Object.keys( this._output );
    outputCategories.forEach( function(key){
      hat.getOutput( key ).setPipeline( p );
    });

  }


  /**
  * Update the whole pipeline due to an update in the filter
  * (new input, new metadata)
  */
  _updatePipeline(){
    if(this._pipeline){
      this._pipeline.update();
    }
  }


  /**
  * @param {String} uuid - uuid to look for
  * @return {Boolean} true if this filter uses an input with such uuid
  */
  hasInputWithUuid( uuid ){
    var found = false;

    var inputCategories = Object.keys( this._inputValidator );
    inputCategories.forEach( function(key){
      found = found | that._getInput( key ).setPipeline( p ) ;
    });

    return found;
  }


  /**
  * @return {Number} the number of inputs
  */
  getNumberOfInputs(){
    return Object.keys( this._inputValidator ).length;
  }

} /* END class Filter */

export { Filter }
