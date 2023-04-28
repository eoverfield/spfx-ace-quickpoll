export class OptionType{
    constructor(public title: string, public value: string) {
        title = this.title;
        value = this.value;
    }
}

export class OptionResultsType{
    constructor(public option: string, public result: string){
        option = this.option;
        result = this.result;
    }
}