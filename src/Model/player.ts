import { Card } from "./card";
import { Table } from "./table";
import { GameDecision } from "./gameDecision";
import { Strategy } from "../Consts/basicStrategy";
import { dAlembertMethod } from "../Consts/d'AlembertMethod";

export class Player{
    private hand:Card[];
    private bet:number;
    private winAmount:number;
    private playerScore:number;
    private gameStatus:string = "betting";
    private gameResult:string = "";
    private prevGameResult:string = "";
    private counting:number;
    private recomendation:string;
    private standardBetAmount = 50;
    private dAlembertCount = 1;

    constructor(private name:string, private type:string,private gameType:string,private chips = 400
    ){
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        this.hand = [];
        this.bet = 0;
        this.winAmount = 0;
        this.playerScore = this.getHandScore;
        this.counting = 0
        this.recomendation = ""
    }

    public drawOne(table:Table):Card | undefined{
        return table.alertIsEmptyAndAction()
    }

    public promptPlayer(table:Table, userData:number):GameDecision{
        let gameDecision:GameDecision = new GameDecision("", userData)
        if(table.getGamePhase === "betting") {
            if(this.type == "ai") gameDecision = this.getAiBetDecision(table);
            else gameDecision = new GameDecision("bet", userData);
        }
        else if (table.getGamePhase === "acting"){
            if(this.type === "ai") gameDecision = this.getAiGameDecision(table);
            else if(this.type === "user") gameDecision = this.getUserGameDecision(userData);
            else gameDecision = this.getHouseGameDecision(table);
        }
        return gameDecision;
    }

    public get getHandScore():number{
        let handScore:number = 0;
        this.hand.forEach(card=>{handScore += card.getRankNumber})
        let ace = this.countAce()
        if(handScore > 21 && this.type != "house" && ace > 0){
            while(ace > 0 && handScore > 21){
                handScore -= 10;
                ace--;
            }
        }
        return handScore;
    }

    private countAce():number{
        let count = 0;
        this.hand.forEach(card=>{if(card.getRank == "A") count++;});
        return count;
    }

    public isBlackJack():boolean{
        return this.getHandScore == 21 && this.hand.length == 2;
    }

    public resetPlayerBet(){
        this.chips += this.bet;
        this.bet = 0;
    }

    public playerAllin(betCoin:number){
        this.bet += betCoin;
        this.chips -= betCoin;
    }

    private getHouseGameDecision(table:Table):GameDecision{
        if(table.allPlayersHitCompleted() && table.allPlayersBetCompleted()){
            if(this.isBlackJack()) return new GameDecision("blackjack", this.bet);
            else if(this.getHandScore < 17) {
                return new GameDecision("hit", -1);
            }
            return new GameDecision("stand", -1);
        }
        else return new GameDecision(this.gameStatus, -1);
    }

    private getAiBetDecision(table:Table):GameDecision{
        if(table.getTurnPlayer.getGameStatus == "game over"){
            return new GameDecision("game over", 0)
        }
        else{
            return new GameDecision("bet", dAlembertMethod(this));
        }
    }

    private getAiGameDecision(table:Table):GameDecision{
        let gameDecision:GameDecision = new GameDecision("",-1)
        if(this.isBlackJack()){
            return new GameDecision("blackjack", this.bet);
        }
        else if(this.gameStatus === "bet"){
            if(gameDecision.getAction == "double" && table.getTurnPlayer.chips < table.getTurnPlayer.bet * 2){
                gameDecision.setAction = "hit";
                return new GameDecision(this.recomendationAction(table), this.bet);            
            }
            else if(gameDecision.getAction == "double") table.getTurnPlayer.setBet = table.getTurnPlayer.getBet * 2;
            else return new GameDecision(this.recomendationAction(table), this.bet);
        }
        else if(this.gameStatus === "hit"){
            return new GameDecision(this.recomendationAction(table), this.bet);
        }
        return new GameDecision(this.gameStatus, this.bet);
    }

    public cheatCounting(table:Table):void{
        // countingの初期化
        table.setAllPlayerCounting = table.getAllPlayerCounting - this.getCounting
        this.setCounting = 0
        const countingHashmap: { [key:string] : number;} = { 
            "10" : -1, 
            "J" : -1, 
            "Q" : -1,  
            "K" : -1,  
            "A" : -1,
            "7" : 0,
            "8" : 0,
            "9" : 0,
        };
        if (this.getType === "house"){
            if (this.hand[0].getRank in countingHashmap) {
                this.counting += countingHashmap[this.hand[0].getRank]
                table.setAllPlayerCounting = table.getAllPlayerCounting + countingHashmap[this.hand[0].getRank]
            }
            else {
                this.counting += 1
                table.setAllPlayerCounting = table.getAllPlayerCounting + 1
            }
        }
        else this.hand.forEach((card) => {
            if (card.getRank in countingHashmap) {
                this.counting += countingHashmap[card.getRank];
                table.setAllPlayerCounting = table.getAllPlayerCounting + countingHashmap[card.getRank]
            }
            else {
                this.counting += 1   
                table.setAllPlayerCounting = table.getAllPlayerCounting + 1
            } 
        })
    }

    public recomendationAction(table:Table):string{
        let userScore:number = table.getTurnPlayer.getHandScore;
        if (userScore < 8) return "hit";
        if (userScore >= 17) return "stand";
        let houseScore:number = table.getHouse.getHand[0].getRankNumber;
        return Strategy[userScore - 8][houseScore - 2];
    }

    private getUserGameDecision(userData:any):GameDecision{
        if(this.isBlackJack()){
            return new GameDecision("blackjack", this.bet);
        }
        else{
            return new GameDecision(userData, this.bet);
        }
    }

    public get getGameStatus():string{
        return this.gameStatus;
    }

    public set setGameStatus(gameStatus:string){
        this.gameStatus = gameStatus;
    }

    public get getHand():Card[]{
        return this.hand;
    }

    public set drawCard(card:any){
        this.hand.push(card)
    }

    public set setHand(card:Card[]){
        this.hand = card;
    }

    public get getWinAmount():number{
        return this.winAmount;
    }

    public set setWinAmount(winAmount:number){
        this.winAmount = winAmount;
    }

    public get getPlayerScore():number{
        return this.playerScore;
    }

    public set setPlayerScore(score:number){
        this.playerScore = score;
    }

    public get getName():string{
        return this.name;
    }

    public get getType():string{
        return this.type;
    }

    public get getChips():number{
        return this.chips;
    }

    public set setChips(chips:number){
        this.chips = chips;
    }

    public get getGameResult():string{
        return this.gameResult;
    }

    public set setGameResult(gameResult:string){
        this.gameResult = gameResult;
    }

    public get getBet():number{
        return this.bet
    }

    public set setBet(bet:number){
        this.bet = bet;
    }

    public randomIntInRange(min:number, max:number){
        return Math.floor(Math.random()* (max-min) + min);
    }

    public get getCounting():number {
        return this.counting;
    }

    public set setCounting(count:number){
        this.counting = count;
    }

    public get getRecomendation():string{
        return this.recomendation;
    }

    public set setRecomendation(recomendation:string){
        this.recomendation = recomendation
    }

    public get getStandardBetAmount():number{
        return this.standardBetAmount;
    }

    public set setStandardBetAmount(multiple:number){
        this.standardBetAmount = this.getStandardBetAmount * multiple;
    }

    public set resetStandardBetAmount(fifty:number){
        this.standardBetAmount = fifty;
    }
    //dAlembertCount

    public get getDAlembertCount():number{
        return this.dAlembertCount;
    }

    public set setDAlembertCount(add:number){
        this.dAlembertCount = this.getDAlembertCount + add;
    }

    public set resetDAlembertCount(zero:number){
        this.dAlembertCount = zero;
    }

    //prevGameResult
    public get getPrevGameResult():string{
        return this.prevGameResult;
    }

    public set setPrevGameResult(result:string){
        this.prevGameResult = result;
    }
}
