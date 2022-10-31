import { Card } from "./card";
import { Table } from "./table";
export class Deck{
    private readonly suits:string[] = ["H", "D", "C", "S"];
    private readonly ranks:string[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    private cards:Card[];

    constructor(private gameType:string){
        this.gameType = gameType;
        this.cards = [];
        this.pushAllcards();
        this.shuffle();
    }

    private pushAllcards():void{
        if(this.gameType == "blackjack"){
            this.suits.forEach((suit) => {
                this.ranks.forEach((rank) => {
                    this.cards.push(new Card(suit, rank))
                })
            })
        }
    }
    public pushRemainingCards(table:Table):void{
        this.suits.forEach((suit) => {
            this.ranks.forEach((rank) => {
                if(!table.cardIsOnTable(suit, rank)){
                    table.drawCard = new Card(suit, rank);
                }              
            })
        })
    }

    public shuffle():void{
        let l = this.cards.length;
        for(let i = l - 1; i > 0; i--){
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
    
    public isEmpty():boolean{
        return this.cards.length == 0;
    }

    public get getCards():Card[]{
        return this.cards;
    }
}