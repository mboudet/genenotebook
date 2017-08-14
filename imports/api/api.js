import './publications.js';

//Import these methods here so they can be used with the Meteor.call('methodName') syntax.
//This is crucial to be able to call them with the asteroid ddp connection in the data-loading scripts
import './transcriptomes/add_transcriptome.js';
import './genomes/add_reference.js';
import './genomes/add_gff.js';
import './genes/interproscan.js'

import './methods/methods.js';
import './methods/blast.js';
import './methods/list.js';

//import this so that it starts running
import './jobqueue/process-interproscan.js';