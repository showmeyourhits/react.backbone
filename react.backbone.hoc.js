import React from 'react';
import Backbone from 'backbone';
import _ from 'underscore';

const DEFAULT_COLLECTION_EVENTS = 'add remove reset sort';
const DEFAULT_MODEL_EVENTS = 'change';

function considerAsCollection(modelOrCollection) {
    return modelOrCollection instanceof Backbone.Collection;
};

function unsub(component, backboneModelOrCollection) {
    if (component) {
        backboneModelOrCollection.off(null, null, component);
    }
}

function subscribe(component, backboneModelOrCollection, events) {
    const isCollection = considerAsCollection(backboneModelOrCollection);
    const defaultEvents = isCollection
        ? DEFAULT_COLLECTION_EVENTS
        : DEFAULT_MODEL_EVENTS;

    const subscribeEvents = events || component.changeOptions || defaultEvents;

    backboneModelOrCollection.on(
        subscribeEvents,
        _[isCollection ? 'debounce' : 'identity']((component.onModelChange || component.forceUpdate).call(component)),
        component
    );
}

/**
 * @typedef {Object} Options
 * @property {?string} changeOptions Backbone events string
 * @property {?string[]} listenToProps Props list that component will listen to. Defaults to ['model', 'collection']
 * 
 * @param {React.Component} ConnectedComponent 
 * @param {Options} options
 * @returns {React.Component}
 */
function connectToBackbone(ConnectedComponent, options) {
    return class extends React.Component {
        static defaultProps = {
            listenToProps: [
                {onPropName: 'model', events: DEFAULT_MODEL_EVENTS},
                {onPropName: 'collection', events: DEFAULT_COLLECTION_EVENTS},
            ],
            changeOptions: '',
        }

        componentDidMount = () => {
            this._isMounted = true;

            this.props.listenToProps.forEach(option => subscribe(this, option));
        }

        componentWillUnmount = () => {
            this._isMounted = false;

            this.props.listenToProps.forEach(option => unsub(this, option));
        }

        render = () => {

        }
    }
}