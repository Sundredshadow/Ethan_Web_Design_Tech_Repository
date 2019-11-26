
	let listID = "abc1234-action-list";
	// 1
	let contentWidth;
	let gifsPerRow;
  	window.onload = (e) => {
		let favoriteArray =JSON.parse(localStorage.getItem("Favorites"));
		document.querySelector("aside").innerHTML="Favorites:\n"+favoriteArray;

		document.querySelector("#search").onclick = searchButtonClicked;
		document.querySelector("#previous").onclick = previous;
		document.querySelector("#next").onclick = next;

		document.querySelector("#previous2").onclick = previous;
		document.querySelector("#next2").onclick = next;
		//window.onscroll=addMoreGifs;
		document.querySelector("#searchterm").value = localStorage.getItem(listID);
	};
	
	// 2
	let displayTerm = "";

	let pageMod=0;
	let pageSwitch=false;
	function previous(){
		pageSwitch=true;
		pageMod--;
		searchButtonClicked();
	}
	function next(){
		pageSwitch=true;
		pageMod++;
		searchButtonClicked();
	}

	/*//note this function is from https://stackoverflow.com/questions/12900744/auto-load-content-on-scroll-down
	let scrollMod=0;
	function addMoreGifs()
	{
		//console.log("scrolled");
		//console.log(document.documentElement.scrollTop);
		//console.log(document.body.clientHeight);
		if (document.documentElement.clientHeight+document.documentElement.scrollTop>=document.body.offsetHeight) {
			// your content loading call goes here.
			scrollMod++;
			console.log(scrollMod);
			searchButtonClicked();
		}
	};*/

	// 3
	function searchButtonClicked(){
		let cont=document.querySelector("#content");
		if(pageSwitch=true)//runs only if previous or next was clicked
		{
			pageSwitch=false;
			cont.innerHTML="";
		}
		
		console.log("searchButtonClicked() called");
		
        const GIPHY_URL="https://api.giphy.com/v1/gifs/search?";

        let GIPHY_KEY="7epRbLLdXuHqmtOyyuqJ0vDbA4xewZsY"

        let url=GIPHY_URL;
        url+="api_key="+GIPHY_KEY;

		let term= document.querySelector("#searchterm").value;
		
		//add term to local storage
		localStorage.setItem(listID, term);

        displayTerm=term;

        term=term.trim();
		
        term= encodeURIComponent(term);

        if(term.length<1) return;

        url+="&q="+term;

		let limit= document.querySelector("#limit").value;
		url+="&offset="+limit*pageMod;
		console.log(limit+","+pageMod);
        url+="&limit="+limit;

		document.querySelector("#status").innerHTML="";
		
		document.querySelector("#content").innerHTML="<img src='images/loading-1.gif'alt=''/>";
        console.log(url);

		getData(url);
	}
	
	function getData(url){
		let xhr=new XMLHttpRequest();
		xhr.onload=dataLoaded;
		xhr.onerror=dataError;
		xhr.open("GET",url);
		xhr.send();
	}

	function dataLoaded(e){
		window.scrollTo(0,0);
		let xhr=e.target;
		console.log(xhr.responseText);

		let obj =JSON.parse(xhr.responseText);

		if(!obj.data|| obj.data.length==0){
			document.querySelector("#status").innerHTML="<b>No results found for'"+displayTerm+"'</b>";
			return;
		}
		
		let results = obj.data;
		let bigString = "<div class= 'resultgroup'>";
		for(let i=0; i<results.length;i++)
		{
			let result=results[i];
			let smallURL=result.images.fixed_height_downsampled.url;
			if(!smallURL) smallURL="images/no-image-found.png";
			let url = result.url;
			//long line that includes data related to result including copyURL and favorite button along with a tag, an img tag
			let line=`<div class='result' id='${result.id}'><a target='_blank' href='${url}'><img src= '${smallURL}' title='${result.id}'/></a><button type='button' id=${url} onclick='URLCOPY(this.id)' class='copyURL'>COPY URL</button><button type='button' id=${result.images.fixed_height_small.url} onclick='Favorite(this.id)' class='favorite'>Fav</button></div>`;
			bigString+=line;
		}
		bigString+="</div>";
		document.querySelector("#content").innerHTML=bigString;
		document.querySelector("#status").innerHTML='<b>Page:'+Number(pageMod+1)+'</b>';
	}

	function createPositionIncreaseArray()
	{
		contentWidth=document.querySelector("#content").offsetWidth;
		gifsPerRow=parseInt(contentWidth/205);//size of content divided by usage gives images per row;

		let results=document.querySelectorAll(".result");
		if(results!=null)//check if results have been intialized
		{
			let columnsMoveMod=[];
			for(i=0; i<gifsPerRow;i++)
			{
				columnsMoveMod.push(0);//simply adds a zero that will be changed as buffer increases;
			}
			return columnsMoveMod;
		}
	}

	function dataError(e){
		console.log("An error occurred");
	}