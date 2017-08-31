import { Mongo } from 'meteor/mongo';
import SimpleSchema from 'simpl-schema';

const Tracks = new Mongo.Collection('tracks');

const trackSchema = new SimpleSchema({
	trackName: {
		type: String,
    label: 'Annotation track name'
	},
	reference: {
		type: String,
    label: 'Reference sequence to which the annotation belongs'
	},
  blastdbs: {
    type: Object,
    optional: true,
  },
  'blastdbs.nucl': {
    type: String,
    optional: true,
    label: 'Nucleotide blast database name'
  },
  'blastdbs.prot': {
    type: String,
    optional: true,
    label: 'Peptide blast database name'
  },
  permissions: {
    type: Array,//[String],
    label: 'Track permissions'
  },
  'permissions.$': {
    type: String
  }
});

Tracks.attachSchema(trackSchema);

export { Tracks, trackSchema };