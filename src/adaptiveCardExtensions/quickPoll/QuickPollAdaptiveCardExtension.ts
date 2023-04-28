import { IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseAdaptiveCardExtension } from '@microsoft/sp-adaptive-card-extension-base';
import { CardView } from './cardView/CardView';
import { SubmittedView } from './quickView/SubmittedView';
import { QuestionView } from './quickView/QuestionView';
import { QuickPollPropertyPane } from './QuickPollPropertyPane';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface IQuickPollAdaptiveCardExtensionProps {
  list: string;
  site: string;
  title: string;
  question: string;
  options: string;
}

export interface IQuickPollAdaptiveCardExtensionState {
  jsonFormat: any;
  user: any;
  list: boolean;
}

const CARD_VIEW_REGISTRY_ID: string = 'QuickPoll_CARD_VIEW';
export const QUICK_VIEW_SUBMIT_REGISTRY_ID: string = 'QuickPoll_SUBMITTED_VIEW';
export const QUICK_VIEW_QUESTION_REGISTRY_ID: string = 'QuickPoll_QUESTION_VIEW';

export default class QuickPollAdaptiveCardExtension extends BaseAdaptiveCardExtension<
  IQuickPollAdaptiveCardExtensionProps,
  IQuickPollAdaptiveCardExtensionState
> {
  private _deferredPropertyPane: QuickPollPropertyPane | undefined;

  public async onInit(): Promise<void> {
    this.state = {
      jsonFormat: null,
      user: null,
      list: false
    };
    let client = await this.context.msGraphClientFactory.getClient('3');
    let userObj = await client.api('/me').get();
    this.setState({user: userObj});

    if (this.properties.site && this.properties.list) {
      var url = this.properties.site + `/_api/web/lists/GetByTitle('${this.properties.list}')/Items?$select=Title,Question,Response`;
      const format = await this.context.spHttpClient.get(url,SPHttpClient.configurations.v1)
          .then((response: SPHttpClientResponse) => {
            return response.json();
          });
      this.setState({jsonFormat: format});
    }
  
    this.cardNavigator.register(CARD_VIEW_REGISTRY_ID, () => new CardView());
    this.quickViewNavigator.register(QUICK_VIEW_SUBMIT_REGISTRY_ID, () => new SubmittedView());
    this.quickViewNavigator.register(QUICK_VIEW_QUESTION_REGISTRY_ID, () => new QuestionView());

    return Promise.resolve();
  }

  protected loadPropertyPaneResources(): Promise<void> {
    return import(
      /* webpackChunkName: 'QuickPoll-property-pane'*/
      './QuickPollPropertyPane'
    )
      .then(
        (component) => {
          this._deferredPropertyPane = new component.QuickPollPropertyPane();
        }
      );
  }

  protected renderCard(): string | undefined {
    return CARD_VIEW_REGISTRY_ID;
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    console.log("get pane", this.properties.list);
    return this._deferredPropertyPane!.getPropertyPaneConfiguration(this.properties, this.context, this.state);
  }
}
