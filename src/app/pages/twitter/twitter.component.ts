import { trigger, transition, style, animate } from '@angular/animations';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Cell } from 'src/app/models/match-cells/cell.model';
import { Evolution } from 'src/app/models/match-cells/evolution/evolution.interface';
import { MultipleMatch } from 'src/app/models/match-cells/evolution/multipleMatch.model';
import { OnlyOneMatch } from 'src/app/models/match-cells/evolution/onlyOneMatch.model';
import { MetaInformation } from 'src/app/models/match-cells/metaInformationModel';
import { Pattern } from 'src/app/models/match-cells/patterns/pattern.interface';
import { Sequence } from 'src/app/models/match-cells/patterns/sequence.model';
import { Symbol } from 'src/app/models/match-cells/patterns/symbol.model';
import { AddSeed } from 'src/app/models/match-cells/rules/addseed.model';
import { Identity } from 'src/app/models/match-cells/rules/identity.model';
import { Rule } from 'src/app/models/match-cells/rules/rule.interface';
import { Solution } from 'src/app/models/match-cells/solution.model';
import { SingletonOffline } from '../../models/singletonOffline.model';
import { NgxSpinnerService } from "ngx-spinner";


import {MatDialog} from '@angular/material/dialog';
import { GenerateInputComponent } from '../../dialogs/generate-input/generate-input.component';
import { Star } from '../../models/match-cells/patterns/star.model';
import { Plus } from '../../models/match-cells/patterns/plus.model';
import { AddRuleComponent } from '../../dialogs/add-rule/add-rule.component';
import { ComposableRule } from '../../models/match-cells/rules/composablerule.model';
import { CustomRule } from '../../models/match-cells/rules/customrule.model';
import { Tweet } from 'src/app/models/tweet.interface';
import { ErrorMessage } from 'src/app/models/errormessage.interface';
import { MatchView } from 'src/app/models/matchview.interface';
import { ChipToken } from '../../models/match-cells/chiptoken.interface';

@Component({
  selector: 'app-twitter',
  templateUrl: './twitter.component.html',
  styleUrls: ['./twitter.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: '0' }),
        animate('.5s ease-out', style({ opacity: '1' })),
      ]),
    ]),
  ],
})
export class TwitterComponent implements OnInit, OnDestroy  {

  newSequence: string = '';

  textExamples: string[] = [
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam ',
    'Li Europan lingues es membres del sam familie. Lor separat existentie es un myth. Por scientie, musica, sport etc, litot Europa usa li sam vocabular. Li lingues differe solmen in li grammatica, li pronunciation e li plu commun vocabules.',
    'Muy lejos, más allá de las montañas de palabras, alejados de los países de las vocales y las consonantes, viven los textos simulados. Viven aislados en casas de letras, en la costa de la semántica, un gran océano de lenguas. ',
    'Y, viéndole don Quijote de aquella manera, con muestras de tanta tristeza, le dijo: Sábete, Sancho, que no es un hombre más que otro si no hace más que otro. Todas estas borrascas que nos suceden son señales de que presto ha de serenar',
    'Reina en mi espíritu una alegría admirable, muy parecida a las dulces alboradas de la primavera, de que gozo aquí con delicia. Estoy solo, y me felicito de vivir en este país, el más a propósito para almas como la mía, soy tan dichoso',
    'Una mañana, tras un sueño intranquilo, Gregorio Samsa se despertó convertido en un monstruoso insecto. Estaba echado de espaldas sobre un duro caparazón y, al alzar la cabeza, vio su vientre convexo y oscuro, surcado',
    'Quiere la boca exhausta vid, kiwi, piña y fugaz jamón. Fabio me exige, sin tapujos, que añada cerveza al whisky. Jovencillo emponzoñado de whisky, ¡qué figurota exhibes! La cigüeña tocaba cada vez mejor el saxofón y el búho pedía kiwi y queso.'
  ];
  hashtagExample: string[] = ['#UCN','#PRAGMATIC','#ULS','#DBZ'];
  
  tweetList: Tweet[] = [];

  newTimer: number = 100;
  timeToGenerate: number = 100;
  timerGenerate: number = this.timeToGenerate;

  // OLD STUFF

  favoriteSeason: string = 'Only One Match';
  seasons: string[] = ['Only One Match', 'Multiple Match'];

  master_checked: boolean = false;
  master_indeterminate: boolean = true;

  _match_complete: boolean = false;
  _match_in_process: boolean = false;
  _input: string = '';
  _token: string = '';
  
  _formatPattern: boolean = false;
  _regexActivate: boolean = false;
  _regexErrorValidator: ErrorMessage = {
    text: '',
    active: false
  }

  _evolutionRule: Evolution = null;
  _postEvolutionRule: Rule = null;


  checkbox_list = [
    {
      name: "Identity",
      disabled: true,
      checked: true,
      deletable: false,
      labelPosition: "after",
      rule: new Identity()
    }, {
      name: "Add Seed",
      disabled: false,
      checked: false,
      deletable: false,
      labelPosition: "after",
      rule: new AddSeed()
    }
  ];
  
  _matchViews: MatchView[] = [];

  availableColors: ChipToken[] = [];


  generateTweetInterval = setInterval(() => { 
    if(this.timerGenerate > 0){
      this.timerGenerate--;
    }else{
      this.generateTweet();
    }
  } , 1000);

  constructor(
    private spinner: NgxSpinnerService,
    public dialog: MatDialog
    ) { }

  ngOnInit(): void {
    for(let i=0; i < 4; i++){
      this.generateTweet(false);
    }
  }

  generateTweet(do_match: boolean = true){
    this.timerGenerate = this.timeToGenerate;
    let text = this.textExamples[this.getRandomInt(this.textExamples.length)];
    this.tweetList.unshift({
      username: 'PLeger',
      content: text.substring(0, text.length),
      hashtag: [this.hashtagExample[this.getRandomInt(this.hashtagExample.length)]],
      match: false,
      total: 0
    });
    if(do_match && this.availableColors.length != 0){
      this.matchProcess();
    }
  }

  setTimerGenerator(){
    if(this.newTimer && this.newTimer >= 1){
      this.timeToGenerate = this.newTimer;
      this.timerGenerate = this.timeToGenerate;
    }
  }

  getRandomInt(max) {
    return Math.floor(Math.random() * Math.floor(max));
  }

  master_change() {
    for (let value of Object.values(this.checkbox_list)) {
      if(value.disabled){
        continue;
      }
      value.checked = this.master_checked;
    }
  }

  addSequence(){
    if(this.newSequence === "") return;

    this.availableColors.unshift(
      {
        name: this.newSequence.toLowerCase().split(" ").join(""),
        pattern: this._regexActivate ? 
        this.generateRegexPattern(this.newSequence.toLowerCase().split(" ").join(""))
        :
        this.generateNoRegexPattern(this.newSequence.toLowerCase().split(" ").join("")),
        color: undefined
      }
    );
    this.newSequence = "";
  }

  generateNoRegexPattern(token: string): Pattern{
    let tokenArr: string[] = [...token];
    let tokenPattern: Pattern;
    if(tokenArr.length == 1){
      tokenPattern = new Symbol(tokenArr[0]);
    }else{
      // Generamos una sequence con los 2 primeros token del array
      tokenPattern = new Sequence(new Symbol(tokenArr[0]), new Symbol(tokenArr[1]));
      for (let index = 2; index < tokenArr.length; index++) {
        tokenPattern = new Sequence(tokenPattern, new Symbol(tokenArr[index]));
      }
    }
    return tokenPattern;
  }

  findCharWithArray(char: string, array: string[]): boolean{
    return array.findIndex((item) => {
      return item === char;
    }) != -1;
  }

  validateBracesTokenRegex(token: string){
    let braces: number = 0;
    let innerElements: number = 0;
    for (let i = 0; i < token.length; ++i) {
      const curCh = token[i];
      if (curCh == '(') {
          braces++;
          continue;
      } else if (curCh == ')') {
          braces--;
          if(braces < 0 || (braces == 0 && innerElements == 0)) return false;
      }
      // TIENE QUE HABER UN ELEMENTO ENTRE MEDIO DE LOS BRACES COMO POR EJEMPLO (abc) ((ac)) para evitar los () ((()))
      if(braces > 0 && !this.findCharWithArray(curCh, ['(',')'])){
        innerElements++;
      }
    }
    if (braces != 0) {
      return false;
    }
    return true;
  }

  validateTokenRegex(token: string): boolean{
    // validar si es solo un elemento (length == 0) que no sea + * ( ) { } [ ]
    if(token.length == 1 && this.findCharWithArray(token,['+','*','(',')'])){
      this._regexErrorValidator = {
        text: 'Token no valid. Remember the characters ( )* or ( )+ are reserved',
        active: true
      }
      return false;
    }
    // validator parenthesis
    if(!this.validateBracesTokenRegex(token)){
      this._regexErrorValidator = {
        text: 'Token no valid. Not valid parenthesis decorator',
        active: true
      }
      return false;
    }

    return true;
  }

  generateInnerPattern(array: string[]): Pattern{
    if(array.length == 1){
      return new Symbol(array[0]);
    }else{
      // Generamos una sequence con los 2 primeros token del array
      let patter_inner = new Sequence(new Symbol(array[0]), new Symbol(array[1]));
      for (let index = 2; index < array.length; index++) {
        patter_inner = new Sequence(patter_inner, new Symbol(array[index]));
      }
      return patter_inner;
    }
  }

  generateRegexPattern(_token: string): Pattern{
    // IF ERRORS
    if(!this.validateTokenRegex(_token)){
      return;
    }
    // IF TOKEN DOESN'T HAVE * or + pattern just use the other method
    if(!this.findCharWithArray('*',[..._token]) && !this.findCharWithArray('+', [..._token])){
      // DELETE BRANCHES AND WORK LIKE A NORMAL STRING
      const token = _token.replace(/[-+()\s]/g, '');
      return this.generateNoRegexPattern(token);
    }else{
      const MAX_LENGTH: number = _token.length;
      let token_array_regex = [..._token];
      let tokenPattern: Pattern = null;
      // Ver caso especial de (...)*, siendo (abcdf)* || (acv)*
      if(token_array_regex[0] == '(' && 
         token_array_regex[MAX_LENGTH - 2] == ')' &&
         this.findCharWithArray(token_array_regex[MAX_LENGTH - 1],['*','+']) &&
         !this.findCharWithArray('*', token_array_regex.slice(1, MAX_LENGTH-2)) && 
         !this.findCharWithArray('+', token_array_regex.slice(1, MAX_LENGTH-2)) &&
         !this.findCharWithArray('(', token_array_regex.slice(1, MAX_LENGTH-2)) &&
         !this.findCharWithArray(')', token_array_regex.slice(1, MAX_LENGTH-2))
      ){
        tokenPattern = (token_array_regex[MAX_LENGTH-1] == '*')?
              new Star(this.generateInnerPattern(token_array_regex.slice(1,MAX_LENGTH-2)))
              :
              new Plus(this.generateInnerPattern(token_array_regex.slice(1,MAX_LENGTH-2)));
        return tokenPattern;
      }
      // Sera siempre una secuencia de tipo
      // Al comenzar el token puede ser de 2 formas
      // a... ||  b... || f... comenzando por alguna letra
      // o
      // empezando por ( para indicar que es clausura o clausura positiva
      let second_position: number = 0;
      let pattern_left: Pattern = null;
      let pattern_right: Pattern = null
      
      // first
      if(token_array_regex[0] != '('){
        pattern_left = new Symbol(token_array_regex[0]);
        second_position = 1;
      }else{
        // es un clausura ( ... )*
        // debemos encontrar el paretensis derecho o el coso de )
        let first_end: number = token_array_regex.findIndex((item, index) => {
          if(index > 0 && item == ')'){
            return index;
          }
        });
        // hace referencia al valor que esta a la derecha de la paretensis de cierre
        let star_clausure_first: boolean = token_array_regex[first_end + 1] == '*';
        let token_inner_first = token_array_regex.slice(1,first_end);
        let pattern_inner_first: Pattern = this.generateInnerPattern(token_inner_first);
        pattern_left = (star_clausure_first)?
                        new Star(
                          pattern_inner_first
                        )
                        :
                        new Plus(
                          pattern_inner_first
                        );
        second_position = first_end + 2;
      }

      let actual_position: number = 0;

      // second
      if(token_array_regex[second_position] != '('){
        pattern_right = new Symbol(token_array_regex[second_position]);
        actual_position = second_position + 1;
      }else{
        // es un clausura ( ... )*
        // debemos encontrar el paretensis derecho o el coso de )
        let second_end: number = token_array_regex.findIndex((item, index) => {
          if(index > second_position && item == ')'){
            return index;
          }
        });
        
        
        // hace referencia al valor que esta a la derecha de la paretensis de cierre
        let star_clausure_second: boolean = token_array_regex[second_end + 1] == '*';
        let token_inner_second = token_array_regex.slice(second_position+1,second_end);
        let pattern_inner_second: Pattern = this.generateInnerPattern(token_inner_second);
        pattern_right = (star_clausure_second)?
                        new Star(
                          pattern_inner_second
                        )
                        :
                        new Plus(
                          pattern_inner_second
                        );
        actual_position = second_end + 2;
      }
      // Generamos una sequence con los 2 primeros token del array
      tokenPattern = new Sequence(pattern_left,pattern_right);
      // ahora solo right pattern
      for (let index = actual_position; index < MAX_LENGTH;) {
        // DERECHO
        if(token_array_regex[index] != '('){
          pattern_right = new Symbol(token_array_regex[index]);
          index++;
        }else{
          // es un clausura ( ... )*
          // debemos encontrar el paretensis derecho o el coso de )
          let end: number = token_array_regex.findIndex((item, idx) => {
            if(idx > index && item == ')'){
              return idx;
            }
          });
          // hace referencia al valor que esta a la derecha de la paretensis de cierre
          let star_clausure: boolean = token_array_regex[end + 1] == '*';
          let token_inner = token_array_regex.slice(index+1,end);
          let pattern_inner: Pattern = this.generateInnerPattern(token_inner);
          pattern_right = (star_clausure)?
                          new Star(
                            pattern_inner
                          )
                          :
                          new Plus(
                            pattern_inner
                          );
          index = end + 2;
        }
        tokenPattern = new Sequence(tokenPattern, pattern_right);
      }

      return tokenPattern;
    }
  }

  list_change(){
    let checked_count = 0;
    //Get total checked items
    for (let value of Object.values(this.checkbox_list)) {
      if(value.checked){
        checked_count++;
      }
    }

    if(checked_count>0 && checked_count<this.checkbox_list.length){
      // If some checkboxes are checked but not all; then set Indeterminate state of the master to true.
      this.master_indeterminate = true;
    }else if(checked_count == this.checkbox_list.length){
      //If checked count is equal to total items; then check the master checkbox and also set Indeterminate state to false.
      this.master_indeterminate = false;
      this.master_checked = true;
    }else{
      //If none of the checkboxes in the list is checked then uncheck master also set Indeterminate to false.
      this.master_indeterminate = false;
      this.master_checked = false;
    }
  }

  openAddRuleDialog(): void {
    const dialogRef = this.dialog.open(AddRuleComponent, {
      width: '600px',
      disableClose: true,
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(result){
        // xd
        const customRule: CustomRule = new CustomRule(result.name, result.js);
        this.checkbox_list.push({
          name: result.name,
          disabled: false,
          checked: false,
          deletable: true,
          labelPosition: "after",
          rule: customRule
        });
      }
    });
  }
  
  remove(chip: string): void {
    const index = this.availableColors.findIndex(item => item.name == chip);

    if (index >= 0) {
      this.availableColors.splice(index, 1);
      this.resetTweetStatus();
    }
  }

  async matchProcess(){
    this.spinner.show();
    this._match_complete = false;
    this._match_in_process = true;
    this.resetTweetStatus();

    this.generateEvolutionRule();
    
    this.generatePostEvolutionRute();

    let cellList: Cell[] = [];

    for (const chiptoken of this.availableColors) {
      cellList.push(
        new Cell(chiptoken.pattern, new MetaInformation(0)
      ));
    }

    for (const tweet of this.tweetList) {
      SingletonOffline.getInstance().Reset();
      let total_matches: number = 0;
      let solution: Solution;
      if(this.favoriteSeason === 'Only One Match'){
        for (const cell of cellList) {
          solution = new Solution([cell],this._evolutionRule, this._postEvolutionRule);
          solution.match(tweet.content.toLowerCase().split(" ").join(""));
          total_matches += SingletonOffline.getInstance().Matches().length;
          SingletonOffline.getInstance().Reset();
        }
      }else{
        solution = new Solution([...cellList],this._evolutionRule, this._postEvolutionRule);
        solution.match(tweet.content.toLowerCase().split(" ").join(""));
        total_matches = SingletonOffline.getInstance().Matches().length;
      }
      tweet.match = total_matches != 0;
      tweet.total = total_matches;
    }

    this._match_in_process = false;
    this._match_complete = true;
    this.spinner.hide();
  }

  generateEvolutionRule(){
    if(this.favoriteSeason === 'Only One Match'){
      this._evolutionRule = new OnlyOneMatch();
    }else{
      this._evolutionRule = new MultipleMatch();
    }
  }

  generatePostEvolutionRute(){
    let rule_list: Rule[] = [];
    for (const item of this.checkbox_list) {
      if(item.checked){
        rule_list.push(item.rule);
      }
    }
    this._postEvolutionRule = new ComposableRule(rule_list);
  }

  resetTweetStatus(){
    this.tweetList.forEach((item) => {
      item.match = false;
    });
  }

  getMatches(){
    return this.tweetList.filter((item) => item.match).length;
  }

  ngOnDestroy() {
    clearInterval(this.generateTweetInterval);
  }

}