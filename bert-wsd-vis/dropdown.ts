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
      placeholderText = 'Enter a word.', buttonText = 'Go') {
    // Default handlers.
    this.onKeystroke = this.onKeystroke || (() => {});
    this.onSelected = this.onSelected || (() => {});

    // Make the prefix tree from the dictionary.
    this.prefixTrie = trie(dictionary);
    this.makeUI(parentContainer, placeholderText, buttonText);
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


  /**
   * Make the UI: a dropdown and an "enter" button.
   * @param parentContainer Container to put all this.
   */
  private makeUI(
      parentContainer: any, placeholderText: string, buttonText: string) {
    parentContainer.node().innerHTML = `
    <div style= "display: flex; align-items: center;">
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
      <div style= "padding: 10px;">
        <button class="go mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--colored"
                disabled="true">
          ${buttonText}
        </button>
      </div>
    </div>
    `;
    this.wordElt = parentContainer.select('.word-enter');
    this.button = parentContainer.select('.go');
    this.autosuggest = parentContainer.select('.autosuggest');
  }
}
