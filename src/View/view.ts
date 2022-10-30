import { Card } from "../Model/card";
import { Table } from "../Model/table";
import { Player } from "../Model/player";
import { Controller } from "../Controller/controller";
export class View{
    static suitImgURL: { [key:string]: string } = { "S" : "https://recursionist.io/img/spade.png", "H" : "https://recursionist.io/img/heart.png", "C" : "https://recursionist.io/img/clover.png",  "D" : "https://recursionist.io/img/diamond.png",  "?" : "https://recursionist.io/img/questionMark.png"
    };
    static config = {
        gamePage: document.getElementById("gameDiv"),
        loginPage: document.getElementById("loginPage"),
        mainPage: document.getElementById("mainPage"),  
    }

    static displayNone(ele:HTMLElement|null){
        ele!.classList.remove("d-block");
        ele!.classList.add("d-none");
    }

    static displayBlock(ele:HTMLElement|null){
        ele!.classList.remove("d-none");
        ele!.classList.add("d-block");
    }

    static renderLoginPage():void{
        View.config.loginPage!.innerHTML = '';
        let container = document.createElement("div");
        container.innerHTML = 
        `
        <p class="text-white">Welcome to Card Game!</p>
        <div class="my-2">
            <input type="text" placeholder="name" value="">
        </div>
        <div class="my-2">
            <select class="w-100">
                <option value="blackjack">Blackjack </option>
                <option value="poker">Poker </option>
            </select>
        </div>
        <div class="my-2">
            <button type="submit" class="btn btn-success" id="startGame">Start Game</button>
        <div>
        `
        View.config.loginPage!.append(container);
    }

    static disableBtnAfterFirstAction(){
        let surrenderBtn:HTMLElement = document.getElementById("surrenderBtn")!;
        let doubleBtn:HTMLElement = document.getElementById("doubleBtn")!;
        surrenderBtn.classList.add("disabled")
        doubleBtn.classList.add("disabled")
    }

    static renderTable(table:Table){
        View.config.mainPage!.innerHTML = '';
        let container = document.createElement("div");
        container.classList.add("col-12", "d-flex", "flex-column");
        container.innerHTML =
        `
            <div id="houesCardDiv" class="pt-5">
            </div>
    
            <!-- Players Div -->
            <div id="playersDiv" class="d-flex m-3 justify-content-center">
            </div><!-- end players -->  
            <!-- actionsAndBetsDiv -->
            <div id="actionsAndBetsDiv" class="d-flex pb-5 pt-4 d-flex flex-column align-items-center">
                <!-- betsDiv -->
                <div id="betsDiv" class="d-flex flex-column w-50 col-3">
                </div><!-- end betsDiv-->
            </div><!-- end actionsAndBetsDiv-->
            <div id="resultLogDiv" class="d-flex pb-5 pt-4 justify-content-center text-white overflow-auto" style="max-height: 120px;">
            </div>
        `
        View.config.mainPage!.append(container);
        View.renderHouseStatusPage(table);
        View.renderPlayerStatusPage(table);
        let isMask:boolean;
        if(table.getGamePhase != "betting") isMask = false;
        else isMask = true;
        View.renderCards(table, isMask);
    }

    static renderBetInfo(table:Table){
        let betDiv:HTMLElement = document.getElementById("betsDiv")!;
        let user:Player = table.getPlayers.filter((player) =>
            player.getType === "user")[0]
        betDiv.innerHTML += 
        ` 
        <p class="m-0 text-center text-white rem3">Bet: $${user.getBet}</p>
        <p class="m-0 text-center text-white rem2">Current Money: $${user.getChips}</p>
        `
    }

    static updatePlayerInfo(table:Table){
        let houesCardDiv:HTMLElement = document.getElementById("houesCardDiv")!
        let playersDiv:HTMLElement = document.getElementById("playersDiv")!;
        houesCardDiv.innerHTML = '';
        playersDiv.innerHTML = '';
        View.renderHouseStatusPage(table)
        View.renderPlayerStatusPage(table) 
    }

    static renderBetBtn(table:Table){
        let betsDiv:HTMLElement = document.getElementById("betsDiv")!;

        let betBtnDiv = document.createElement("div");

        const colorHash: { [key: number]: string } = { 5 : "btn-danger", 20 : "btn-primary", 50 : "btn-success",  100 : "btn-dark" };
        
        betBtnDiv.classList.add("py-2", "h-60", "d-flex", "justify-content-between");
        for(let i = 0; i < table.getBetDenominations.length; i++){
            let bet = table.getBetDenominations[i]
            betBtnDiv.innerHTML +=
            `
            <div>
                <div class="input-group" >
                    <span class="input-group-btn">
                        <button type="button" class="btn ${colorHash[bet]} rounded-circle p-0 btn-lg" style="width:3rem;height:3rem;" id="betValue" value=${bet}>${bet}</button>
                    </span>
                </div>
            </div>
            `
        }

        let dealResetDiv = document.createElement("div");
        dealResetDiv.classList.add("d-flex", "justify-content-between", "m-2")
        dealResetDiv.innerHTML =
        `            
        <button type="submit" class="w-30 rem5 text-center btn btn-primary" id="deal">DEAL</button>
        <button type="button" class="w-30 rem5 text-center btn btn-primary" id="reset">RESET</button>
        <button type="submit" class="w-30 rem5 text-center btn btn-primary" id="allIn">ALL IN</button>
        `
        betsDiv.append(betBtnDiv, dealResetDiv);

        //10月27日queryselectorに苦戦
        let selectors = betsDiv.querySelectorAll<HTMLInputElement>("#betValue");
        let user = table.getPlayers.filter((player)=>player.getType === "user")[0];

        selectors.forEach((selector) => {
            selector.addEventListener("click", function(){
                Controller.clickBetBtn(parseInt(selector.value), user);
                View.updateBetInfo(table);
                View.renderBetBtn(table);
            })
        })

        let deal:Element = betsDiv.querySelectorAll("#deal")[0];
        deal.addEventListener("click", function(){
            if(user.getBet < 5) alert("Minimum bet is $" + "5" + '.')
            else{
                user.setChips = user.getChips + user.getBet;
                Controller.controlTable(table);
            }
        })

        let reset:Element = betsDiv.querySelectorAll("#reset")[0];
        reset.addEventListener("click", function(){
            user.resetPlayerBet();
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        })

        let allIn:Element = betsDiv.querySelectorAll("#allIn")[0];
        allIn.addEventListener("click", function(){
            let allBet = user.getChips;
            user.playerAllin(allBet);
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        })
    }
    //動作確認済み
    static renderHouseStatusPage(table:Table):void{
        let houesCardDiv:HTMLElement = document.getElementById("houesCardDiv")!;
        houesCardDiv.innerHTML = '';
        let houseCardsDiv = table.getHouse.getName + "CardsDiv"
        houesCardDiv.innerHTML +=
        `
        <p class="m-0 text-center text-white rem3">${table.getHouse.getName}</p>
        <div class="text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center">
            <p class="rem1 text-left">Status:${table.getHouse.getGameStatus}&nbsp</a>
        </div>
            <!-- House Card Row -->
        <div id=${houseCardsDiv} class="d-flex justify-content-center pt-3 pb-2">   
        </div>
        `
    }

    static renderPlayerStatusPage(table:Table){
        let playersDiv:HTMLElement = document.getElementById("playersDiv")!;
        playersDiv.innerHTML = '';
        let allPlayers:Player[] = table.getPlayers;
        allPlayers.forEach((player) => {
            let playerDiv:string = player.getName + "PlayerDiv";
            let cardsDiv = player.getName + "CardsDiv";
            playersDiv.innerHTML +=
            `
            <div id=${playerDiv} class="d-flex flex-column w-50">
                <p class="m-0 text-white text-center rem3">${player.getName}</p>
    
                <!-- playerInfoDiv -->
                <div class="text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center">
                    <p class="rem1 text-left">Status:${player.getGameStatus}&nbsp</a>
                    <p class="rem1 text-left">Bet:${player.getBet}&nbsp</a>
                    <p class="rem1 text-left">Chips:${player.getChips}&nbsp</a>
                </div>
    
                <!-- cardsDiv -->
                <div id=${cardsDiv} class="d-flex justify-content-center">
                </div><!-- end Cards -->
            </div><!-- end player -->        
            `       
        })
    }

    static renderCardDiv(card:Card, ele:string, isMask:boolean){
        let targetElement:HTMLElement = document.getElementById(ele)!;
        let suit:string = isMask ? "?" : card.getSuit;
        let rank:string = isMask ? "?" : card.getRank;

        targetElement.innerHTML +=
        `
        <div class="bg-white border rounded mx-2">
            <div class="text-center">
                <img src=${View.suitImgURL[suit]} alt="" width="50" height="50">
            </div>
            <div class="text-center">
                <p class="m-0 ">${rank}</p>
            </div>
        </div>
        `
    }

    static renderCards(table:Table, flag:boolean){
        let allPlayers:Player[] = table.getPlayers;
        let house = table.getHouse;
        let houseCardsDiv:string = house.getName + "CardsDiv"
        let houseCards:Card[] = house.getHand
        if(house.getGameStatus === "Waiting for actions"){
            View.renderCardDiv(houseCards[0], houseCardsDiv, false);
            View.renderCardDiv(houseCards[1], houseCardsDiv, true);
        }
        else{
            houseCards.forEach(card=>{View.renderCardDiv(card, houseCardsDiv, flag)});
        }
        allPlayers.forEach((player) => {
            player.getHand.forEach((card) => {
                View.renderCardDiv(card, player.getName + "CardsDiv", flag);
            })
        })
    } 

    static updateBetInfo(table:Table):void{
        let betBtnDiv:HTMLElement = document.getElementById("betsDiv")!;
        betBtnDiv.innerHTML = "";
        View.renderBetInfo(table);
    }

    static updateActionBetInfo(table:Table){
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        actionsAndBetsDiv.innerHTML = '';
        View.renderActionBtn(table);
    }

    static renderActionBtn(table:Table){
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        actionsAndBetsDiv.innerHTML =
        `
        <div id ="actionsDiv" class="d-flex flex-wrap w-70 p-3 justify-content-center">
            <div class="py-2 mx-2">
                <a class="text-dark btn btn-light px-5 py-1" id="surrenderBtn">Surrender</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-success px-5 py-1" id="standBtn">Stand</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-warning px-5 py-1" id="hitBtn">Hit</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-danger px-5 py-1" id="doubleBtn">Double</a>
            </div>            
        </div>
        `
        let actionList = ["surrender", "stand", "hit", "double"]
        actionList.forEach(function(action){
            let actionBtn:HTMLElement = document.getElementById(action + "Btn")!;
            actionBtn.addEventListener("click", function(){
                table.haveTurn(action);
                Controller.controlTable(table);
                // console.log(action)
            })
        })
    }

    static createNextGameBtnDiv():HTMLElement{
        let div:HTMLElement = document.createElement("div");
        let nextGame = document.createElement("a");
        div.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "col-5");
        nextGame.classList.add("text-white", "btn", "btn-primary", "px-5", "py-1")
        nextGame.id = "nextGame";
        nextGame.innerText = `Next Game`;
        div.append(nextGame);
        return div;
    }

    static renderResult(table:Table):void{
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        let userData = table.getPlayers.filter(user=>user.getType === "user");
        let gameResult = userData[0].getGameResult.toUpperCase();
        let div = View.createNextGameBtnDiv();

        actionsAndBetsDiv.innerHTML = '';

        let p = document.createElement("p");
        p.classList.add("m-0", "text-white", "text-center", "rem3");
        p.innerText = `${gameResult}`
        div.append(p);
        actionsAndBetsDiv.append(div);
        
        let nextGameBtn:Element = actionsAndBetsDiv.querySelectorAll("#nextGame")![0];
        nextGameBtn.addEventListener("click", function(){
            table.haveTurn(table)
            table.blackjackAssignPlayerHands();
            Controller.controlTable(table);
        })
    }

    static renderLogResult(table:Table){
        let resultLogDiv:HTMLElement = document.getElementById("resultLogDiv")!;
        let div = document.createElement("div");
        div.classList.add("text-white", "w-50");
        div.innerHTML +=
        `
        <p>rounnd ${table.getResultLog.length + 1}</p>
        `
        div.append(table.blackjackEvaluateAndGetRoundResults());
        resultLogDiv.append(div);
    }

    static renderAllLog(table:Table):void{
        let resultLogDiv:HTMLElement = document.getElementById("resultLogDiv")!;
        let div = document.createElement("div");
        div.classList.add("text-white", "w-50");
        for(let i = 0; i < table.getResultLog.length; i++){
            div.innerHTML +=
            `
            <p>rounnd ${i + 1}</p>
            `
            div.append(table.getResultLog[i]);
        }
        resultLogDiv.append(div);        
    }

    static renderGameOver():void{
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        actionsAndBetsDiv.innerHTML +=

        `
        <div class="d-flex flex-column justify-content-center align-items-center col-5">
            <p class="m-0 text-white text-center rem3">GAME OVER</p>
        </div>
        <div class="d-flex justify-content-around m-2 col-2">
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="newGame">New Game</button>
        </div>
        `
        let newGameBtn = actionsAndBetsDiv.querySelectorAll("#newGame")[0];
        newGameBtn.addEventListener("click", function(){
            View.displayNone(View.config.mainPage);
            View.displayBlock(View.config.loginPage);    
            Controller.startGame();
        });
    }
}