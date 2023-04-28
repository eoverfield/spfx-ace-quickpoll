import { ISPFxAdaptiveCard, BaseAdaptiveCardView, ISubmitActionArguments } from '@microsoft/sp-adaptive-card-extension-base';
import { MSGraphClientV3, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { IQuickPollAdaptiveCardExtensionProps, IQuickPollAdaptiveCardExtensionState, QUICK_VIEW_SUBMIT_REGISTRY_ID } from '../QuickPollAdaptiveCardExtension';
import { OptionType } from '../../../models/Option';

export interface IQuestionViewData {
  question: string;
  options: any[];
}

export class QuestionView extends BaseAdaptiveCardView<
  IQuickPollAdaptiveCardExtensionProps,
  IQuickPollAdaptiveCardExtensionState,
  IQuestionViewData
> {
  public get data(): IQuestionViewData {
    let options: OptionType[] = [];
    var values = this.properties.options.split(',');
    var i = 0;
    
    while(i < values.length){
      options[i] = new OptionType(values[i].trim(), values[i].trim());
      i = i + 1;
    }

    return {
      question: this.properties.question,
      options: options
    };
  }

  public async onAction(action: ISubmitActionArguments): Promise<void> {
    if (action.id == "SubmitResponse"){
      let response = action.data.response;
      let question = this.properties.question;
      let client = await this.context.msGraphClientFactory.getClient('3');
      let user = this.state.user;
      let siteurl = this.properties.site.split("/");
      var siteid: any;
      if (siteurl.length < 5){
        siteid = await client.api(`/sites/${siteurl[2]}:/${siteurl[3]}`).select('id').get();
      }else{
        siteid = await client.api(`/sites/${siteurl[2]}:/${siteurl[3]}/${siteurl[4]}`).select('id').get();
      }
      var lookupID: string = "";
      var url = this.context.pageContext.site.absoluteUrl + "/_api/web/lists/GetByTitle('User Information List')/Items?$select=Title,Id";
      const format = await this.context.spHttpClient.get(url,SPHttpClient.configurations.v1)
                              .then((spResponse: SPHttpClientResponse) => {
                                  return spResponse.json();
                              });

      var len = Object.keys(format["value"]).length;
      var found = false;
      var i = 0;
      while (i < len && !found){
          if(format["value"][i]["Title"] == user.displayName){
              lookupID = format["value"][i]["Id"];
              found = true;
          }
          i++;
      }

      var requestBody = `
      {
          fields: {
              Title: "${user.displayName}",
              UserLookupId: "${lookupID}",
              Question: "${question}",
              Response: "${response}"
          }
      }`;

      if (this.properties.list) {
        this.context.msGraphClientFactory
                .getClient('3')
                .then((graphClient: MSGraphClientV3) => {
                  graphClient
                    .api(`/sites/${siteid.id}/lists/${this.properties.list}/items`)
                    .version('beta')
                    .post(requestBody);
                  }
                );
      }

      this.quickViewNavigator.replace(QUICK_VIEW_SUBMIT_REGISTRY_ID);
    }
  }

  public get template(): ISPFxAdaptiveCard {
    return require('./template/QuestionViewTemp.json');
  }
}