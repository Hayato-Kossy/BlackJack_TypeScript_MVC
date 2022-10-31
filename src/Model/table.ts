import { Card } from "./card";
import { Deck } from "./deck";
import { Player } from "./player";
import { GameDecision } from "./gameDecision";

export class Table{
    private deck:Deck;
    private gamePhase:string;
    private players:Player[];
    private house:Player;
    private turnCounter:number;
    private resultLog:HTMLElement[]
    private isCardClosed:boolean
    constructor(private gameType:string, private readonly betDenominations = [5,20,50,100]){
        this.gameType = gameType;
        this.deck = new Deck(this.gameType)
        this.players = [];
        this.house = new Player("Dealer", "house", this.gameType);
        this.gamePhase = "betting";
        this.resultLog = [];
        this.turnCounter = 0;
        this.isCardClosed = false;
    }

    public set setPlayers(userName:string){
        this.players.push(new Player("AI1", "ai", this.gameType));
        this.players.push(new Player(userName, "user", this.gameType));
        this.players.push(new Player("AI2", "ai", this.gameType));
    }

    public cardIsOnTable(suit:string, rank:string):boolean{
        let houseHand:Card[] = this.house.getHand
        this.players.forEach((player) => {
            let playerHand:Card[] = player.getHand;
            playerHand.forEach((card) => {
                if(card.getSuit == suit && card.getRank == rank) return true;
            })
        })
        houseHand.forEach((card) => {
            if(card.getSuit == suit && card.getRank == rank) return true;
        })
        return false;
    }

    private evaluateMove(gameDecision:GameDecision, player:Player) {
        player.setGameStatus = gameDecision.getAction;
        player.setBet = gameDecision.getAmount;
        switch(gameDecision.getAction){
            case "betting":
                break;
            case "hit":
                player.drawCard = player.drawOne(this);
                if (player.getHandScore > 21) player.setGameStatus = "bust";
                break;
            case "stand":
                break;
            case "surrender":
                break;
                case "double":
                    if(this.turnCounter - 4 <= this.players.length){
                        player.setBet = player.getBet * 2;
                        player.drawCard = player.drawOne(this);
                        if(player.getHandScore > 21) player.setGameStatus = "bust"
                        break;
                    }
                    else break;
                case "game over":
                    break;            
        }
    }

    public blackjackEvaluateAndGetRoundResults():HTMLElement{
        let list:HTMLElement = document.createElement("ul") as HTMLElement;
        this.players.forEach((player) => {
            let playerListResult:HTMLElement = document.createElement("li");
            playerListResult.textContent = `name: ${player.getName}, action: ${player.getGameStatus}, bet: ${player.getBet}, won: ${player.getWinAmount}, result: ${player.getGameResult}`
            list.append(playerListResult);       
        })
        this.resultLog.push(list);
        return list;
    }

    public blackjackAssignPlayerHands(){
        while(this.house.getHand.length < 2){
            this.house.drawCard = this.house.drawOne(this);
        }

        this.players.forEach((player) => {
            if (player.getGameStatus != "game over"){
                while (player.getHand.length < 2){
                    player.drawCard = player.drawOne(this);
                }
            }
        })
    }

    private blackjackClearPlayerHandsAndBets():void{
        this.players.forEach((player) => {
            player.setHand = [];
            player.setBet = 0;
            player.setWinAmount = 0;
            if (player.getGameStatus !== "game over"){
                player.setGameStatus = "betting";
            }
            player.setGameResult = '';
        })
        this.house.setHand = [];
        this.house.setGameStatus = "betting";
    }

    public haveTurn(userData:any):void{
        let turnPlayer:Player = this.getTurnPlayer();
        if(this.gamePhase === "betting"){
            if(turnPlayer.getType === "house"){
                this.house.setGameStatus = "Waiting for bets"
            }
            else if(turnPlayer.getType === "user" || turnPlayer.getType === "ai"){
                this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
            if(this.onLastPlayer()){
                this.gamePhase = "acting";
                this.house.setGameStatus = "Waiting for actions"
            }
        }

        else if(this.gamePhase === "acting"){
            if(this.getIsAllActionsCompleted){
                this.evaluateWinners();
                this.setGamePhase = "roundOver";
            }
            else{
            this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
        }
        else if(this.gamePhase === "roundOver"){
            this.gamePhase = "betting";
            this.house.setGameStatus = "Waiting for bets";
            this.turnCounter = 0;
            this.blackjackClearPlayerHandsAndBets()
        }
        this.turnCounter++;
    }

    private onLastPlayer():boolean{
        return this.turnCounter % (this.players.length + 1) === this.players.length;
    }

    public allPlayersHitCompleted():boolean{
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].getGameStatus == "hit") return false; 
        }
        console.log("True")
        return true; 
    }

    public get userAndAICompleted():boolean{
        let actionList = ["stand"]
        this.players.forEach((player) => {
            if (!actionList.indexOf(player.getGameStatus)) return false;
        })
        return true;
    }
    private evaluateWinners():void{
        this.players.forEach((player) => {
            if(player.getGameStatus === "surrender") this.calcWinAmount(player, "surrender");
            else if(player.getGameStatus === "bust") this.calcWinAmount(player, "bust");
            else{
                switch(this.house.getGameStatus){
                    case "blackjack":
                        if (player.getGameStatus === "blackjack") this.calcWinAmount(player, "push");
                        else this.calcWinAmount(player, "lose");
                        break;
                    case "bust":
                        this.calcWinAmount(player, "win")
                        break;
                    default:
                        if(player.getGameStatus === "blackjack"){
                            this.calcWinAmount(player, "win")
                        }
                        else if(player.getHandScore > this.house.getHandScore){
                            this.calcWinAmount(player, "win")
                        }
                        else if(player.getHandScore === this.house.getHandScore){
                            this.calcWinAmount(player, "push")
                        }
                        else{
                            this.calcWinAmount(player, "lose")
                        }
                }
            }
        })
    }
    
    public calcWinAmount(player:Player, result:string):void{
        switch(player.getGameStatus){
            case "blackjack":
                if(result != "push"){
                    player.setWinAmount = Math.floor(player.getBet * 1.5);
                    break;
                }
                else break;
            case "surrender":
                player.setWinAmount = Math.floor(player.getBet / 2);
                break;
            case "bust":
                player.setWinAmount = player.getBet;
                break;
            default:
                if(result == "push") break;
                else player.setWinAmount = player.getBet;                
        }
        if(result === "lose" || player.getGameStatus === "bust" || player.getGameStatus === "surrender") player.setWinAmount = player.getBet * -1;
        if(result != "push") player.setChips = player.getChips + player.getWinAmount;

        if(player.getGameStatus != "blackjack") player.setGameResult = result;
        else player.setGameResult = "blackjack";
        this.checkGameOver(player);
    }

    public checkGameOver(player:Player):void{
        if(player.getType == "user" && player.getChips < 5){
            player.setGameStatus = "game over";
            this.gamePhase = "gameOver";
        }
        else if(player.getChips < 5) player.setGameStatus = "game over";
    }

    public allPlayersBetCompleted():boolean{
        for(let i = 0; i < this.players.length; i++){
            if(this.players[i].getGameStatus == "bet") return false;
        }
        return true;   
    }

    private houseActionCompleted():boolean{
        return this.house.getGameStatus != "hit" && this.house.getGameStatus != "Waiting for actions";
    }

    public get getIsAllActionsCompleted():boolean{
        return this.houseActionCompleted() && this.allPlayersHitCompleted();
    }

    public getTurnPlayer():Player{
        let index:number = this.turnCounter % (this.players.length + 1);
        if (index === 0) return this.house;
        else return this.players[index - 1];
    }

    public alertIsEmptyAndAction():Card | undefined{
        if (this.deck.isEmpty()){
            alert("No cards left. Shuffle the cards.")
            this.getDeck.pushRemainingCards(this);
            this.getDeck.shuffle();
            if(this.getGamePhase != "roundOver") return this.getDeck.getCards.pop();
        }
        else return this.getDeck.getCards.pop();
    }
    public get getGamePhase():string{
        return this.gamePhase;
    }

    public get getBetDenominations():number[]{
        return this.betDenominations;
    }

    public set setGamePhase(gamePhase:string){
        this.gamePhase = gamePhase;
    }

    public get getDeck():Deck{
        return this.deck
    }

    public set drawCard(card:Card){
        this.deck.getCards.push(card); 
    }

    public get getPlayers():Player[]{
        return this.players;
    }

    public get getHouse():Player{
        return this.house;
    }

    public get getResultLog():HTMLElement[]{
        return this.resultLog;
    }

    public get getGameType():string{
        return this.gameType;
    }

    public get getIsCardClosed():boolean{
        return this.isCardClosed;
    }

    public set setIsCardClosed(state:boolean){
        this.isCardClosed = state;
    }

}
