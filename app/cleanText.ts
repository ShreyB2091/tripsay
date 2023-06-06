const cleanText = (txtin: string) => {

  txtin = txtin.replace(/\'m/g,` am`);
  txtin = txtin.replace(/\'re/g,` are`);
  txtin = txtin.replace(/\blet\'s\b/g,`let us`);
  txtin = txtin.replace(/\'s/g,` is`);
  txtin = txtin.replace(/ain\'t/g,` is not it`);
  txtin = txtin.replace(/n\'t/g,` not`);
  txtin = txtin.replace(/\'ll/g,` will`)
  txtin = txtin.replace(/\'d/g,` would`);
  txtin = txtin.replace(/\'ve/g,` have`);
  txtin = txtin.replace(/\lemme/g,` let me`);
  txtin = txtin.replace(/\gimme/g,` give me`);
  txtin = txtin.replace(/\wanna/g,` want to`);
  txtin = txtin.replace(/\gonna/g,` going to`);
  txtin = txtin.replace(/r u /g,`are you`);
  txtin = txtin.replace(/\bim\b/g,`i am`);
  txtin = txtin.replace(/\bwhats\b/g,`what is`);
  txtin = txtin.replace(/\bwheres\b/g,`where is`);
  txtin = txtin.replace(/\bwhos\b/g,`who is`);
  
  txtin = txtin.replace(/(^\s*)|(\s*$)/gi,"");
  txtin = txtin.replace(/[ ]{2,}/gi," ");
  txtin = txtin.replace(/\n /,"\n");

  const stopwordsymbols = ["+","-","*","%","/","?","!","^","'","\"",",",";","\\","."];
  for (let i = 0; i < stopwordsymbols.length; i++)
  {
    var re = new RegExp("\\" + stopwordsymbols[i], 'g');
    txtin = txtin.replace(re,"");
  }
  return txtin;
}

module.exports = cleanText;