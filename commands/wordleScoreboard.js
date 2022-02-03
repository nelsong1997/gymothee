async function wordleScoreboard ( message) {

    let channelName = message.channel.name;
   
    // Not wordle channel
    if( !channelName.toLowerCase().includes( "wordle" ) ){
      message.channel.send( "Scoreboard command can only be used in the dedicated wordle thread" );
      return;
    }
 
    //if( a[ aKey ].avg > b[ bKey ].avg ){ return 1; };
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
