// @flow
import * as React from 'react';
import { type Abfahrt } from 'types/abfahrten';
import { connect } from 'react-redux';
import { getAuslastung } from 'client/actions/auslastung';
import { getAuslastungForIdAndStation } from 'client/selector/auslastung';
import Close from '@material-ui/icons/Close';
import Done from '@material-ui/icons/Done';
import ErrorOutline from '@material-ui/icons/ErrorOutline';
import Help from '@material-ui/icons/Help';
import Loading from '../Loading';
import Tooltip from '@material-ui/core/Tooltip';
import withStyles, { type StyledProps } from 'react-jss';
import type { AppState } from 'AppState';

type StateProps = {|
  +auslastung: ?{ +first: 0 | 1 | 2, +second: 0 | 1 | 2 },
|};
type DispatchProps = {|
  +getAuslastung: typeof getAuslastung,
|};
type OwnProps = {|
  +abfahrt: Abfahrt,
|};
type ReduxProps = {|
  ...StateProps,
  ...DispatchProps,
  ...OwnProps,
|};

type Props = StyledProps<ReduxProps, typeof styles>;

function getTooltipText(auslastung) {
  switch (auslastung) {
    case 0:
      return 'Nicht ausgelastet';
    case 1:
      return 'Zug ausgelastet';
    case 2:
      return 'Zug stark ausgelastet';
    default:
      return 'Unbekannt';
  }
}

function getIcon(auslastung) {
  switch (auslastung) {
    case 0:
      return <Done fontSize="inherit" />;
    case 1:
      return <ErrorOutline fontSize="inherit" />;
    case 2:
      return <Close fontSize="inherit" />;
    default:
      return <Help fontSize="inherit" />;
  }
}

class Auslastung extends React.PureComponent<Props> {
  componentDidMount() {
    const { auslastung, getAuslastung, abfahrt } = this.props;

    if (!auslastung) {
      getAuslastung(abfahrt.trainId);
    }
  }

  preventDefault = (e: SyntheticEvent<>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  render() {
    const { auslastung, classes } = this.props;

    if (auslastung === null) {
      return null;
    }

    if (auslastung === undefined) {
      return <Loading type={1} />;
    }

    return (
      <div className={classes.main}>
        <div className={classes.entry}>
          <span>1</span>
          <Tooltip title={getTooltipText(auslastung.first)}>
            <span className={`${classes.icon} ${classes.first}`}>{getIcon(auslastung.first)}</span>
          </Tooltip>
        </div>
        <div className={classes.entry}>
          <span>2</span>
          <Tooltip title={getTooltipText(auslastung.second)}>
            <span className={`${classes.icon} ${classes.second}`}>{getIcon(auslastung.second)}</span>
          </Tooltip>
        </div>
      </div>
    );
  }
}

function getBGColor(auslastung) {
  switch (auslastung) {
    case 0:
      return 'green';
    case 1:
      return 'yellow';
    case 2:
      return 'red';
    default:
      return 'black';
  }
}
const getColor = auslastung => ({
  backgroundColor: getBGColor(auslastung),
  color: auslastung === 1 ? 'black' : 'white',
});

export const styles = {
  main: {
    display: 'flex',
    marginBottom: '.3em',
  },
  entry: {
    display: 'flex',
    flexDirection: 'column',
    marginRight: '.5em',
    alignItems: 'center',
  },
  icon: {
    fontSize: '.7em',
    display: 'inline-block',
    borderRadius: '50%',
    textAlign: 'center',
    padding: '.2em',
    lineHeight: 0,
    color: 'white',
  },
  first: (props: ReduxProps) => getColor(props.auslastung?.first),
  second: (props: ReduxProps) => getColor(props.auslastung?.second),
};

export default connect<ReduxProps, OwnProps, StateProps, DispatchProps, AppState, _>(
  (state, props) => ({
    auslastung: getAuslastungForIdAndStation(state, props),
  }),
  ({
    getAuslastung,
  }: DispatchProps)
)(withStyles<Props>(styles)(Auslastung));
