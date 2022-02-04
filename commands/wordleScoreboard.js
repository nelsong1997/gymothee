async function wordleScoreboard ( message) {
 
    const wordleRegexPattern = /wordle [0-9]{3} [1-6]\/6/im;
 
    let userArray = [];
    let msgArray = []; 

    // REF: https://github.com/iColtz/discord-fetch-all/blob/main/src/functions/fetchMessages.js
    // Reads all messages in the channel
    let lastFetchID;
    let keepFetching = true;
    while( keepFetching ){
      let fetchedMessages = await message.channel.messages.fetch({ 
        limit:100,
        ...( lastFetchID && { before:lastFetchID} ),
        });
     
      if( fetchedMessages.size == 0 ){
        keepFetching = false;
      }
      for( let [ key, value ] of fetchedMessages ){
        //if( value.content.startsWith( "Wordle" ) ){
        if( wordleRegexPattern.test( value.content ) ){
          userArray.push( value.author.username );
          msgArray.push( value.content );
        }
      }
      lastFetchID = fetchedMessages.lastKey( );
    }    

    // Data Structure
    // { username : { sum : X , trys : Y } };
    // Maybe store { username : index } so sbMap is redundent when filling avgArray
    let sbMap = [ ];

    let slashIdx = 0;
    for( let ii = 0 ; ii < msgArray.length ; ii++ ){
      slashIdx = msgArray[ ii ].search( "/" );
      if( userArray[ ii ] in sbMap ){
        sbMap[ userArray[ ii ] ][ 'sum' ] += ( msgArray[ ii ][ slashIdx - 1].charCodeAt( 0 ) ) - 48;
        sbMap[ userArray[ ii ] ][ 'trys' ]++;
      } else {
        sbMap[  userArray[ ii ] ] = { 'sum' : msgArray[ ii ][ slashIdx - 1].charCodeAt( 0 )-48, 'trys' : 1 };
      }
    }
 
    avgArray = [];
    for( let key in sbMap ){
      avgArray.push( { [key] : { avg : sbMap[ key ][ 'sum' ]/sbMap[ key ][ 'trys' ] , trys : sbMap[ key ][ 'trys' ] } } );  
    }

    avgArray.sort( function( a, b ){ 
      let aKey = Object.keys( a );
      let bKey = Object.keys( b );
      if( a[ aKey ].avg > b[ bKey ].avg ){ return 1; };
      if( a[ aKey ].avg < b[ bKey ].avg ){ return -1; };
      if( a[ aKey ].avg == b[ bKey ].avg ){
        if( a[ aKey ].trys > b[ bKey ].trys ){ return 1; }
        if( a[ aKey ].trys < b[ bKey ].trys ){ return -1; }
        if( a[ aKey ].trys == b[ bKey ].trys ){ return 0; }
      };    
    } );
    

    //Format Scoreboard
    let scoreboardStr = "User, Average Score, Num Wordles\n";
    for( let ii = 0 ; ii < avgArray.length ; ii++ ){
      let userName = Object.keys( avgArray[ ii ] );
      scoreboardStr += userName; 
      scoreboardStr += ", ";
      scoreboardStr += avgArray[ ii ][ userName ].avg;
      scoreboardStr += ", ";
      scoreboardStr += avgArray[ ii ][ userName ].trys;
      scoreboardStr += "\n";
    }
    message.channel.send( scoreboardStr );    
}

module.exports = wordleScoreboard;

