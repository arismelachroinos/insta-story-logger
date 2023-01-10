let usersArray = [];
let usersLikedArray = [];
let linkArray = [];
const delayOpenList = 5000;
const delayOpenStory = 2000;
const delayPerScroll = 5000;
let currentTry = 0;
const totalTries = 5;

openStories();

setTimeout(()=>{
    main();
}, delayOpenStory);


function main(){
    //reset arrays
    usersArray.length = usersLikedArray.length = linkArray.length = 0;

    if(!stopIfPlaying() && !isStoryOn()){ //if story popup is not visible
        return false; //no more stories
    }

    if(!openList() && !storyIsOn())
        return false;

    setTimeout(()=>{
        saveAndScroll();
    }, delayOpenList);
}

function stopIfPlaying(){
    let svg = document.querySelector('svg[aria-label="Pause"]');
    if(!svg) return false;
    svg.closest('button').click();
    console.log("Story was paused");
    return true;
}

function getTextOfElementWithoutChildren(element){
    let text = "";
    [...element.childNodes].forEach(node=>{
        if (node.nodeType === Node.TEXT_NODE)
            text += node.nodeValue;
    });
    return text;
}

function openList(){
    let seenSpan = document.querySelector('button[type="button"] > div > span > span').parentElement;

    if (getTextOfElementWithoutChildren(seenSpan).trim()!=="Seen by")
        return false;
    seenSpan.click();
    return true;
}

function saveAndScroll(){
    let [savedUsers, lastUser] = saveUsers();

    console.log(`savedUsers: ${savedUsers}`);

    savedUsers===0 ? currentTry++ : currentTry = 0;

    if(savedUsers>0 || currentTry<totalTries){
        scrollToLastUser(lastUser);
        setTimeout(()=>{
            saveAndScroll();
        }, delayPerScroll);
    }else{
        let mergedArray = [...usersLikedArray, ...usersArray];
        console.dir(usersArray);

        let storyId = document.location.href.match(/\/(\d+)\/$/)?.[1];
        if(!storyId)
            storyId = "Unknown";

	    download(storyId.toString() + ".txt", mergedArray.join("\n"));

        //close list
        closeList();

        setTimeout(()=>{
            //hit next story 
            nextStory();
        }, delayOpenList);

    }
}

function nextStory(){
    let next = document.querySelector('button[aria-label="Next"]');
    next && next.click();

    setTimeout(()=>{
        main();
    }, delayOpenStory);
}

function openStories(){
    let profilePic = document.querySelector('div[aria-disabled="false"][role="button"][tabindex="0"][style] > span > img[alt][draggable="false"]');

    profilePic && profilePic.click();
}

function scrollToLastUser(lastUser){
    lastUser.scrollIntoView();
}

function saveUsers(){
    console.log("Saving users...");
    let images = document.querySelectorAll('div[aria-labelledby][class] a[role="link"][tabindex="0"][href][style] > img[alt]');
    let newUsers = 0;
    [...images].forEach(image=>{
        let link = image.parentElement.href;
        
        //skip users that have already been saved
        if(linkArray.indexOf(link) !== -1)
            return false;

        newUsers++;

        let liked = image.parentElement.parentElement.querySelector('svg[aria-label="Liked"]');
        liked!==null && liked!==undefined ? liked = true : liked = false;

        liked ? usersLikedArray.push([link, "Liked"]) : usersArray.push(link);

        // usersArray.push(liked ? [link, "Liked"] : link);
        linkArray.push(link);
    }, newUsers);
    return [newUsers, images[images.length-1]];
}

function download(filename, text) {
	var element = document.createElement('a');
	element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
	element.setAttribute('download', filename);
	element.style.display = 'none';
	document.body.appendChild(element);
	element.click();
	document.body.removeChild(element);
}

function isStoryOn(){
    let storyIsOn = document.querySelector('svg[aria-label="Pause"], svg[aria-label="Play"]');
    if(storyIsOn!==null && storyIsOn!==undefined)
        return true;
    return false;
}

function closeList(){
    let closeButtons = document.querySelectorAll('svg[aria-label="Close"]');
    if(closeButtons.length===2){
        closeButtons[1].closest('button').click();
        return true;
    }
    return false;
}

function isListOn(){
    let closeButtons = document.querySelectorAll('svg[aria-label="Close"]');
    if(closeButtons.length===2)
        return true;
    return false;
}