import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { FlowRouter } from 'meteor/kadira:flow-router';

import React from 'react';
import Select from 'react-select';
import update from 'immutability-helper';

import { submitBlastJob } from '/imports/api/blast/submitblastjob.js';
import { Tracks } from '/imports/api/genomes/track_collection.js';

import './submitblast.scss';


/**
 * Function to determine whether a given sequence string is DNA or protein
 * @param  {String} seq Input sequence, unknown if DNA or protein
 * @return {String}     Either 'Nucleotide' or 'Protein'
 */
function determineSeqType(seq){
  const dna = 'cgatCGAT'
  let fractionDna = 0
  let i = dna.length
  while (i--){
    let nuc = dna[i]
    fractionDna += (seq.split(nuc).length - 1) / seq.length
  }
  const seqType = fractionDna >= 0.9 ? 'Nucleotide' : 'Protein'
  return seqType
}

/**
 * Textarea input field to input sequences for blasting
 * @param  {Object} props [description]
 * @return {SequenceInput}       [description]
 */
const SequenceInput = (props) => {
  return (
    <div>
      <textarea 
        className="form-control" 
        rows="10" 
        id="blast_seq" 
        type="text" 
        placeholder="Enter sequence" 
        value={props.value}
        onChange={props.enterSequence}
      />
      {
        props.value &&
        <div className="btn-group pull-right">
          <button type="button" className="btn btn-outline-secondary btn-sm disabled">This is a</button>
          <button type="button" className="btn btn-secondary btn-sm dropdown-toggle" data-toggle="dropdown">
            <strong>{props.seqType}</strong> sequence
            <span className="caret"></span>
          </button>
          <div className="dropdown-menu">
            <a className="dropdown-item" id="Protein" onClick={props.selectSeqType} href="#">
              Protein sequence
            </a>
            <a className="dropdown-item" id="Nucleotide" onClick={props.selectSeqType} href="#">
              Nucleotide sequence
            </a>
          </div> 
        </div>
      }
    </div>
  )
}

const TrackSelect = (props) => {
  return (
    <div>
      <label> Select tracks: </label>
        {
          props.tracks.map(track => {
            console.log(props.selectedTracks,track.trackName,props.selectedTracks.indexOf(track.trackName))
            return (
              <div className="form-check" key={track.trackName}>
                <input 
                  type="checkbox" 
                  className="form-check-input" 
                  id={ track.trackName } 
                  checked={props.selectedTracks.indexOf(track.trackName) >= 0}
                  onChange={props.toggleTrackSelect} 
                />
                <label className="form-check-label" htmlFor={ track.trackName }>{ track.trackName }</label>
              </div>
            )
          })
        }
    </div>
  )
}

const SubmitButtons = (props) => {
  return (
    <div className='btn-group'>
      <div className="btn-group">
        <button type="button" className="btn btn-outline-primary dropdown-toggle" data-toggle="dropdown">
          <strong>{props.selectedDbType}</strong> database <span className="caret"></span>
        </button>
        <div className="dropdown-menu">
        {
          props.dbTypes.map(dbType => {
            return (
                <a key={dbType} className="dropdown-item db-select" id={dbType} onClick={props.selectDbType}>
                  {dbType} database
                </a>
            )
          })
        }
        </div>
      </div>
      <div className='btn-group'>
        <button 
          type="button" 
          className="btn btn-primary" 
          id="submit-blast"
          onClick={props.submit}>
          <span className="glyphicon glyphicon-search" /> {props.blastType.toUpperCase()}
        </button>
      </div>
    </div>
  )
}

class SubmitBlast extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      input: undefined,
      seqType: 'Nucleotide',
      dbType: 'Protein',
      selectedTracks: []
    }
  }

  /**
  * Hard coded map of sequence types to blast database types to select the appropriate blast program
  * @type {Object}
  */
   BLASTTYPES = {
    'Nucleotide': {
        'Nucleotide': 'blastn',
        'Protein': 'blastx',
        'Translated nucleotide': 'tblastx'
      },
    'Protein': {
      'Protein': 'blastp',
      'Translated nucleotide': 'tblastn'
    }
  };

  enterSequence = event => {
    event.preventDefault();
    const input = event.target.value;
    const seqType = input ? determineSeqType(input): undefined;
    this.setState({
      input: input,
      seqType: seqType
    })
  }

  selectSeqType = event => {
    event.preventDefault();
    const seqType = event.target.id;
    const dbType = Object.keys(this.BLASTTYPES[seqType])[0]
    this.setState({
      seqType: seqType,
      dbType: dbType
    })
  }

  selectDbType = event => {
    event.preventDefault();
    const dbType = event.target.id;
    console.log('selectDbType',dbType)
    this.setState({
      dbType: dbType
    })
  }

  toggleTrackSelect = event => {
    const trackName = event.target.id;
    const index = this.state.selectedTracks.indexOf(trackName);
    const operation = index < 0 ? { $push: [trackName] } : { $splice: [[index]] };
    const newState = update(this.state, { selectedTracks: operation });

    /*
    let newState;
    if (index < 0){
      newState = update(this.state, {
        selectedTracks: {
          $push: [trackName]
        }
      })
    } else {
      newState = update(this.state, {
        selectedTracks: {
          $splice: [[index]]
        }
      })
    }
    */
    this.setState(newState)
  }

  submit = event => {
    event.preventDefault();
    const blastType = this.BLASTTYPES[this.state.seqType][this.state.dbType];
    submitBlastJob.call({
      blastType: blastType,
      input: this.state.input,
      trackNames: this.state.selectedTracks
    }, (err,res) => {
      console.log(err)
      FlowRouter.redirect(`/blast/${res}`)
    })
  }

  render(){
    return (
      this.props.loading ? 
      <div>LOADING</div> :
      <form className="container form-group" role="form" id="blast">
        <div className="card">
          <div className="card-header">Blast search</div>
          <div className="card-body">
            <SequenceInput 
              value = {this.state.input}
              seqType = {this.state.seqType}
              enterSequence = {this.enterSequence}
              selectSeqType = {this.selectSeqType}
            />
          </div>
            <ul className="list-group list-group-flush">
              <li className="list-group-item">
                <TrackSelect 
                  tracks = {this.props.tracks}
                  selectedTracks = {this.state.selectedTracks}
                  toggleTrackSelect={this.toggleTrackSelect}
                />
              </li>
              <li className="list-group-item">
                Advanced options ...
              </li>
            </ul>
          <div className="card-footer">
            <div className="row">
              <label className="col-md-4">Search a ...</label>
              <div className="col-md-6">
                {
                  !this.state.input &&
                  <button type="button" className="btn btn-outline-secondary disabled">
                    <span className="fa fa-question-circle-o"></span> Enter sequence
                  </button>
                }
                {
                  this.state.input && this.state.selectedTracks.length == 0 &&
                  <button type="button" className="btn btn-outline-secondary disabled">
                    <span className="fa fa-question-circle-o"></span> Select track
                  </button>
                }
                {
                  this.state.input && this.state.selectedTracks.length > 0 && 
                  <SubmitButtons 
                    selectedDbType = {this.state.dbType}
                    dbTypes = {Object.keys(this.BLASTTYPES[this.state.seqType])}
                    selectDbType = {this.selectDbType}
                    blastType = {this.BLASTTYPES[this.state.seqType][this.state.dbType]}
                    submit = {this.submit}
                  />
                }
              </div>
            </div>
          </div>
        </div>
      </form>
    )
  }
}

export default withTracker(props => {
  const subscription = Meteor.subscribe('tracks');
  return {
    loading: !subscription.ready(),
    tracks: Tracks.find({}).fetch()
  }
})(SubmitBlast)