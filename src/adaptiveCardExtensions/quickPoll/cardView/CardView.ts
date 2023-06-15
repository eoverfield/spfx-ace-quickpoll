import {
  BasePrimaryTextCardView,
  IPrimaryTextCardParameters,
  IExternalLinkCardAction,
  IQuickViewCardAction,
  ICardButton
} from '@microsoft/sp-adaptive-card-extension-base';
import { IQuickPollAdaptiveCardExtensionProps, IQuickPollAdaptiveCardExtensionState, QUICK_VIEW_QUESTION_REGISTRY_ID, QUICK_VIEW_SUBMIT_REGISTRY_ID } from '../QuickPollAdaptiveCardExtension';

export class CardView extends BasePrimaryTextCardView<IQuickPollAdaptiveCardExtensionProps, IQuickPollAdaptiveCardExtensionState> {
  public get cardButtons(): [ICardButton] | [ICardButton, ICardButton] | undefined {
    if (this.properties.options && this.properties.question && this.properties.site && this.properties.list){
        const format = this.state.jsonFormat;
        if (!format) {
          return;
        }
        let found = false;
        let user = this.state.user;
        var len = Object.keys(format["value"]).length;

        for (var i = 0; i < len; i++){
          if(format["value"][i]["Title"] == user.displayName && format["value"][i]["Question"] == this.properties.question){
            found = true;
          }
        }

        if(found){
          return [
            {
              title: "See Results",
              action: {
                type: 'QuickView',
                parameters: {
                  view: QUICK_VIEW_SUBMIT_REGISTRY_ID
                }
              }
            }
          ];
        }else{
          return [
            {
              title: "Take Poll",
              action: {
                type: 'QuickView',
                parameters: {
                  view: QUICK_VIEW_QUESTION_REGISTRY_ID
                }
              }
            }
          ];
      }
    }
  }

  public get data(): IPrimaryTextCardParameters {
    if(this.properties.options && this.properties.question  && this.properties.site && this.properties.list){
        return {
          primaryText: "NEW Quick Poll",
          description: this.properties.question,
          title: this.properties.title
        };
    }else{
        return {
          primaryText: "NO Quick Poll",
          description: "There is no poll right now, Please configure card.",
          title: this.properties.title
        };
      }
    }
}
// function async(arg0: string) {
//   throw new Error('Function not implemented.');
// }

