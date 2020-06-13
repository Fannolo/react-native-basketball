import React from 'react';

const GlobalContext = React.createContext({});

export class GlobalContextProvider extends React.Component {
  render() {
    return (
      <GlobalContext.Provider
        value={{
          ...this.state,
          switchToOnline: this.switchToOnline,
          switchToOffline: this.switchToOffline,
        }}>
        {this.props.children}
      </GlobalContext.Provider>
    );
  }
}
