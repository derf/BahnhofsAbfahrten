// @flow
import { connect } from 'react-redux';
import { type ContextRouter, withRouter } from 'react-router-dom';
import { format } from 'date-fns';
import { getNextDeparture } from 'client/selector/abfahrten';
import { getStationsFromAPI } from 'client/actions/abfahrten';
import ActionHome from '@material-ui/icons/Home';
import AppBar from '@material-ui/core/AppBar';
import debounce from 'debounce-promise';
import HeaderButtons from './HeaderButtons';
import Helmet from 'react-helmet-async';
import IconButton from '@material-ui/core/IconButton';
import React from 'react';
import Select from 'react-select/lib/Async';
import Toolbar from '@material-ui/core/Toolbar';
import type { Abfahrt, Station } from 'types/abfahrten';
import type { AppState } from 'AppState';

type StateProps = {|
  +currentStation: ?$PropertyType<$PropertyType<AppState, 'abfahrten'>, 'currentStation'>,
  +searchType?: string,
  +baseUrl: string,
  +nextAbfahrt: ?Abfahrt,
|};

type Props = {|
  ...StateProps,
  ...ContextRouter,
|};

const selectStyles = {
  dropdownIndicator: () => ({
    display: 'none',
  }),
  indicatorSeparator: () => ({
    display: 'none',
  }),
  placeholder: (base: Object) => ({
    ...base,
    color: 'hsl(0, 0%, 45%)',
  }),
  option: (base, state) => ({
    ...base,
    background: state.isFocused ? 'lightgrey' : 'white',
    color: 'black',
  }),
  container: () => ({
    flex: 1,
    position: 'relative',
  }),
};

const debouncedGetStationFromAPI = debounce(getStationsFromAPI, 500);

class Header extends React.Component<Props> {
  metaTags = () => {
    const { currentStation, baseUrl, nextAbfahrt } = this.props;

    let title = 'Bahnhofsabfahrten';
    let ogDescription =
      'Zugabfahrten für Stationen der Deutsche Bahn. Nutzt verschiedene Quellen um möglichst genaue Informationen bereitzustellen. Nutzt teilweise offizielle, teilweise inoffizielle Quellen.';
    let description = ogDescription;
    let url = `https://${baseUrl}`;
    const image = `https://${baseUrl}/android-chrome-384x384.png`;

    if (currentStation) {
      title = `${currentStation.title} - ${title}`;
      description = `Zugabfahrten für ${currentStation.title}`;
      ogDescription = description;
      if (nextAbfahrt && nextAbfahrt.scheduledDeparture) {
        ogDescription = `Nächste Abfahrt: ${nextAbfahrt.train} - ${nextAbfahrt.destination} - ${format(
          nextAbfahrt.scheduledDeparture,
          'HH:mm'
        )} (${nextAbfahrt.delayDeparture < 0 ? '-' : '+'}${nextAbfahrt.delayDeparture})`;
      }
      url += `/${encodeURIComponent(currentStation.title)}`;
    }

    return (
      <Helmet>
        <title>{title}</title>
        <link rel="canonical" href={url} />
        <meta name="description" content={description} />
        {/* Twitter Start */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:site" content="@marudor" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={ogDescription} />
        <meta name="twitter:creator" content="@marudor" />
        <meta name="twitter:image" content={image} />
        {/* Twitter End */}
        {/* Open Graph Start */}
        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:image" content={image} />
        <meta property="og:url" content={url} />
        <meta property="og:locale" content="de_DE" />
        {/* Open Graph End */}
      </Helmet>
    );
  };
  submit = (station: Station) => {
    if (!station) {
      return;
    }
    this.props.history.push(`/${encodeURIComponent(station.title)}`);
  };
  toRoot = () => this.props.history.push('/');
  getOptionLabel = (station: Station) => station.title;
  getOptionValue = (station: Station) => station.id;
  loadOptions = (term: string) => debouncedGetStationFromAPI(term, this.props.searchType);
  render() {
    const { currentStation } = this.props;

    return (
      <>
        {this.metaTags()}
        <AppBar position="fixed">
          <Toolbar disableGutters>
            <IconButton aria-label="Home" onClick={this.toRoot} color="inherit">
              <ActionHome color="inherit" />
            </IconButton>
            <Select
              autoFocus={!currentStation}
              aria-label="Suche nach Bahnhof"
              styles={selectStyles}
              loadOptions={this.loadOptions}
              getOptionLabel={this.getOptionLabel}
              getOptionValue={this.getOptionValue}
              placeholder="Bahnhof (z.B. Hamburg Hbf)"
              value={currentStation}
              onChange={this.submit}
            />
            <HeaderButtons />
          </Toolbar>
        </AppBar>
      </>
    );
  }
}

export default connect<_, *, StateProps, _, AppState, _>(state => ({
  currentStation: state.abfahrten.currentStation,
  searchType: state.config.config.searchType,
  baseUrl: state.config.baseUrl,
  nextAbfahrt: getNextDeparture(state),
}))(withRouter(Header));
