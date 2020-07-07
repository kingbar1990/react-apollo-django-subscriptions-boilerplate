import React from 'react';
import { withStyles, createMuiTheme, MuiThemeProvider } from '@material-ui/core/styles';
import './styles/components/vendors/react-loading-bar/index.css';
import applicationTheme from './styles/theme/applicationTheme'

const styles = {
  root: {
    width: '100%',
    minHeight: '100vh',
    marginTop: 0,
    zIndex: 1,
  }
};

export const AppContext = React.createContext();

class ThemeWrapper extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pageLoaded: true,
      theme: createMuiTheme(applicationTheme(props.color, props.mode)),
    };
  }

  componentWillMount = () => {
    this.onProgressShow();
  }

  componentDidMount = () => {
    this.playProgress();
  }

  componentWillUnmount() {
    this.onProgressShow();
  }

  handleChangeMode = mode => {
    const { color, changeMode } = this.props;
    this.setState({ theme: createMuiTheme(applicationTheme(color, mode)) });
    changeMode(mode);
  };

  onProgressShow = () => {
    this.setState({ pageLoaded: true });
  }

  onProgressHide = () => {
    this.setState({ pageLoaded: false });
  }

  playProgress = () => {
    this.onProgressShow();
    setTimeout(() => {
      this.onProgressHide();
    }, 500);
  }

  render() {
    const { classes, children } = this.props;
    const { pageLoaded, theme } = this.state;
    return (
      <MuiThemeProvider theme={theme}>
        <div className={classes.root}>
          <AppContext.Provider value={this.handleChangeMode}>
            {children}
          </AppContext.Provider>
        </div>
      </MuiThemeProvider>
    );
  }
}


export default withStyles(styles)(ThemeWrapper);
