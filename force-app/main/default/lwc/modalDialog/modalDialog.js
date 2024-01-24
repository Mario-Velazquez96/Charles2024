/* eslint-disable @lwc/lwc/no-async-operation */
import { LightningElement, api, track } from 'lwc';
import { classnames } from 'c/utils';

/**
 * A reusable modal dialog component. It handles the overlay and keeping tab
 * focus inside the modal. It does not automatically manage open/close state,
 * that's intentionally left up to the parent consumer.
 *
 * Usage:
 *    <c-modal-dialog
 *       visible={boolean}
 *       onclose={Function}
 *       title={string}
 *    >
 *      <div slot="body">
 *        Modal content
 *      </div>
 *      <div slot="footer">
 *        Optional footer content
 *      </div>
 *    </c-modal-dialog>
 *
 * References:
 * - The LWC modal recipe: https://github.com/trailheadapps/lwc-recipes/tree/master/force-app/main/default/lwc/modal
 * - The modal design in the lightning design system (mostly stuff we get for free with the above recipe) https://www.lightningdesignsystem.com/components/modals/
 * - The react-modal package: https://github.com/reactjs/react-modal
 */

export default class ModalDialog extends LightningElement {
    @api visible = false;
  @api title = 'Modal';
  @api size;
  @api innerComponent = false;

  @track _hasOpened = false;

  get modalBackdropClass() {
    const openClass = this.innerComponent && this._hasOpened;
    return classnames('slds-backdrop', { 
      'fadein slds-backdrop--open': this._hasOpened,
      'inner-cover': openClass,
    });
  }

  get modalClass() {
    const openClass = this.innerComponent && this._hasOpened  
    return classnames('slds-modal', { 
      'slds-fade-in-open': this._hasOpened, 
      'inner-section': openClass,
    });
  }

  connectedCallback() {
    this.template.addEventListener('keyup', this.onKeyUp);
  }

  disconnectedCallback() {
    this.template.removeEventListener('keyup', this.onKeyUp);
  }

  renderedCallback() {
    // The LWC modal recipe doesn't have the fade in animation. Fade-in happens
    // when the "slds-fade-in-open" class is *added* to the slds-modal class,
    // firing the css transition. This adds the class one frame after we're
    // made visible, causing the nice fade-in animation
    if (this.visible && !this._hasOpened) {
      setTimeout(() => {
        this._hasOpened = true;

        // Focus the close button when the modal first launches. This has to
        // be done *after* the above, which triggers a full re-render and we
        // lose the DOM element after
        setTimeout(() => {
          this.focusClose();
        });
      });
    } else if (!this.visible && this._hasOpened) {
      this._hasOpened = false;
    }
  }

  // If something outside the modal is focused, trap it and re-focus the close
  // button, to prevent the <tab> key from focusing things behind the overlay.
  // Needs to be autobound (fat arrow syntax) as this is passed to child
  onTrapFocus = () => {
    this.focusClose();
  };

  // Imperatively focus on the close button
  focusClose() {
    if (this.visible) {
      this.template.querySelector('.slds-modal__close').focus();
    }
  }

  // Optionally show the footer slot only if it has contents
  handleFooterSlotChange(evt) {
    const slot = evt.target;
    const hasFooter = slot.assignedElements().length !== 0;
    this.template.querySelector('footer').classList.toggle('slds-hide', !hasFooter);
  }

  // Detect click on the close button and let parent know
  onClose() {
    const filterChangeEvent = new CustomEvent('close');
    this.dispatchEvent(filterChangeEvent);
  }

  // Close the modal if escape is pressed
  onKeyUp = event => {
    if ('Escape' === event.code) {
      this.onClose();
    }
  };

  get containerClassList() {
    return classnames('slds-modal__container', this.size ? this.size + '-modal' : '');
  }

  get isInnerComponent() {
    return this.innerComponent ? 'inner-component' : '';
  }
}