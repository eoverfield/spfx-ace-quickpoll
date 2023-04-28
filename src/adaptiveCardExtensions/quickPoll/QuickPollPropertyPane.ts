import { PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { IQuickPollAdaptiveCardExtensionProps, IQuickPollAdaptiveCardExtensionState } from './QuickPollAdaptiveCardExtension';
import { BaseComponentContext } from '@microsoft/sp-component-base';

export class QuickPollPropertyPane {
  
  public getPropertyPaneConfiguration(props: IQuickPollAdaptiveCardExtensionProps, context: BaseComponentContext, state: IQuickPollAdaptiveCardExtensionState) {
    return {
      pages: [
        {
          header: { description: "" },
          groups: [
            {
              groupName: "Quick Poll Customization",
              groupFields: [
                PropertyPaneTextField('question', {
                  label: 'Enter your question for the poll:'
                }),
                PropertyPaneTextField('options', {
                  label: 'Enter options:',
                  description: 'Enter options for question, seperated by commas.'
                })
              ]
            },
            {
              groupName: "Quick Poll Storage",
              groupFields: [
                PropertyPaneTextField('site', {
                  label: 'Enter the site url:',
                  description: 'Enter url of site where your storage list is located.'
                }),
                PropertyPaneTextField('list', {
                  label: 'Enter the list name:',
                  description: 'Enter name of list where your would like the responses to be stored'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}