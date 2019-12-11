/**
 * @license
 * Copyright 2018 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */

import trie from 'trie-prefix-tree';

export class WordSelectorDropdown {
  private prefixTrie: trie;
  private wordElt: any;
  private button: any;
  private autosuggest: any;

  constructor(
      dictionary: string[], parentContainer: any,
      private onSelected: ((word: string) => void) = null,
      private onKeystroke: ((word: string) => void) = null,
      placeholderText = 'Enter a word.') {
    // Default handlers.
    this.onKeystroke = this.onKeystroke || (() => {});
    this.onSelected = this.onSelected || (() => {});

    // Make the prefix tree from the dictionary.
    this.prefixTrie = trie(dictionary);
    this.makeUI(parentContainer, placeholderText);
    this.addHandlers();
  }

  hideButton() {
    this.button.style('display', 'none');
  }
  // When the user hits "enter" or the "go" button, search for word
  // neighbors.
  private enterWord() {
    const word = this.getWordEltVal();
    if (this.prefixTrie.hasWord(word)) {
      this.onSelected(word);
      this.autosuggest.html('');
    }
  };

  /**
   * Add handlers for when the user either enters a letter, hits the "go"
   * button, or hits "enter."
   */
  private addHandlers() {
    this.wordElt.on('input', () => this.handleWordInput());
    this.button.on('click', () => this.enterWord());
    document.addEventListener('keydown', (e) => {
      // checks whether the pressed key is "Enter"
      const keyIsEnter = e.keyCode === 13;
      const fieldHasFocus = document.activeElement == this.wordElt.node();
      if (keyIsEnter && fieldHasFocus) {
        this.enterWord();
      }
    });
  }

  /**
   * Handle when the user types in the box.
   */
  private handleWordInput() {
    const letters = this.getWordEltVal();
    this.autosuggest.html('');

    // If the word is valid, enable the button.
    const legitWord = this.prefixTrie.hasWord(letters);
    this.button.attr('disabled', legitWord ? null : true);

    this.onKeystroke(letters);

    // Create the autosuggestions
    if (letters.length > 0) {
      const words = this.prefixTrie.getPrefix(letters).slice(0, 5);
      this.autosuggest.selectAll('.word-option')
          .data(words)
          .enter()
          .append('div')
          .classed('word-option', true)
          .text((d: any) => d)
          .on('click', (d: any) => {
            this.onKeystroke(d);
            (this.wordElt.node() as HTMLInputElement).value = d;
            this.autosuggest.html('');
            this.button.attr('disabled', null);
            this.enterWord();
          });
    }
  }

  /**
   * Get the current value of the input field.
   */
  private getWordEltVal() {
    return (this.wordElt.node() as HTMLInputElement).value.toLowerCase();
  }

  public setEltVal(value: string) {
    return (this.wordElt.node() as HTMLInputElement).value = value;
  }



  /**
   * Make the UI: a dropdown and an "enter" button.
   * @param parentContainer Container to put all this.
   */
  private makeUI(parentContainer: any, placeholderText: string) {
    parentContainer.node().innerHTML = `
    <div class='dropdown-holder'>
      <div>
        <form action="#">
          <div class="mdl-textfield mdl-js-textfield">
            <input class="word-enter mdl-textfield__input"
                    type="text"
                    autocomplete="off"
                    placeholder="${placeholderText}">
          </div>
        </form>
        <div class="autosuggest">
        </div>
      </div>

      <!-- Go -->
      <div>
        <button class="go mdl-button mdl-js-button mdl-button--icon"
                disabled="true">
          <i class='material-icons'>
          search
          </i>
        </button>
      </div>
    </div>
    `;
    this.wordElt = parentContainer.select('.word-enter');
    this.button = parentContainer.select('.go');
    this.autosuggest = parentContainer.select('.autosuggest');
  }
}
