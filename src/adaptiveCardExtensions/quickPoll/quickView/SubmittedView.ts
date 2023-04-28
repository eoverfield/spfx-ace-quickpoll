import { ISPFxAdaptiveCard, BaseAdaptiveCardView } from '@microsoft/sp-adaptive-card-extension-base';
import { IQuickPollAdaptiveCardExtensionProps, IQuickPollAdaptiveCardExtensionState } from '../QuickPollAdaptiveCardExtension';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { OptionResultsType } from '../../../models/Option';

export interface ISubmittedViewData {
  selectedList: string;
  optionResults: OptionResultsType[];
  chartURL: string;
}

export class SubmittedView extends BaseAdaptiveCardView<
  IQuickPollAdaptiveCardExtensionProps,
  IQuickPollAdaptiveCardExtensionState,
  ISubmittedViewData
> {
  public get data(): ISubmittedViewData {
    var values = this.properties.options.split(',');
    let results = new Array(values.length); for (let x=0; x<values.length; ++x) results[x] = 0;
    var options = '';
    for(var y = 0; y<values.length; y++){
      if (y == (values.length - 1)){
        options = options + "'"+values[y]+"'";
      }else{
        options = options + "'"+values[y]+"',";
      }
    }
    this.setFormat();

    const format = this.state.jsonFormat;
    var len = Object.keys(format["value"]).length;
    var len2 = values.length;
    
    for (var i = 0; i < len; i++){
      if(format["value"][i]["Question"] == this.properties.question){
        for(var j = 0; j < len2; j++){
          if(format["value"][i]["Response"] == values[j]){
            results[j] = results[j] + 1;
          }
        }
      }
    }

    var link = "https://quickchart.io/chart?c=%7Btype:%27bar%27,data:%7Blabels:["+options+"],%20datasets:[%7Blabel:%27Responses%27,data:["+results+"]%7D]%7D%7D";

    let optionResults: OptionResultsType[] = [];
    for(var z = 0; z < values.length; z++) {
      optionResults[z] = new OptionResultsType(values[z].trim(), results[z].toString());
    }
    
    return {
      selectedList: 'Poll Responses',
      optionResults: optionResults,
      chartURL: link
    };
  }

  public async setFormat(){
    if (this.properties.site && this.properties.list) {
      var url = this.properties.site + `/_api/web/lists/GetByTitle('${this.properties.list}')/Items?$select=Title,Question,Response`;
      const format = await this.context.spHttpClient.get(url,SPHttpClient.configurations.v1)
                          .then((response: SPHttpClientResponse) => {
                            return response.json();
                          });

      this.setState({jsonFormat: format});
    }
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/SubmittedViewTemp.json');
  }
}