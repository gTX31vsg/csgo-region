import React, { Component } from 'react';
import {
	ComposableMap,
	ZoomableGroup,
	Geographies,
	Geography,
	Markers,
	Marker,
} from 'react-simple-maps';
import {
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	CircularProgress,
	Typography,
	Button,
} from '@material-ui/core';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import worldMap from './assets/world.json';

const baseCommand = 'sdr SDRClient_ForceRelayCluster ';
const sourceURL = 'https://raw.githubusercontent.com/SteamDatabase/GameTracking-CSGO/master/platform/config/network_config.json';

const correctedMarkers = [
	{ id: 'mad', coordinates: [-3.704113, 40.416633] },
	{ id: 'lux', name: "Luxembourg", coordinates: [6.131607, 49.611896] },
	{ id: 'syd', name: "Sydney", coordinates: [151.043869, -33.842662] },
];

export default class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			loading: true,
			error: false,
			selectedRegion: null,
			regionData: null,
		};
	}

	async componentWillMount() {
		let fetched;
		try {
			fetched = (await (await fetch(sourceURL)).json()).pops;
		} catch (ex) {
			this.setState({ error: true });
			return;
		}

		this.setState({
			loading: false,
			regionData: fetched,
		});
	}

	getErrorModal() {
		const { error } = this.state;

		return (
			<Dialog
				open={error}
				onClose={null}
				aria-labelledby="loading-dialog"
			>
				<DialogTitle>Error</DialogTitle>
				<DialogContent style={{ textAlign: 'center' }}>
					<Typography variant="body1">
						Couldn't fetch server list. Please try again later.
					</Typography>
				</DialogContent>
				<DialogActions>
				</DialogActions>
			</Dialog>
		);
	}

	getLoadingDialog() {
		const { loading } = this.state;

		return (
			<Dialog
				open={loading}
				onClose={null}
				aria-labelledby="loading-dialog"
			>
				<DialogTitle>Fetching server list</DialogTitle>
				<DialogContent style={{ textAlign: 'center' }}>
					<CircularProgress />
				</DialogContent>
				<DialogActions>
				</DialogActions>
			</Dialog>
		);
	}

	getSelecRegionDialog() {
		const { regionData, selectedRegion } = this.state;

		return (
			<Dialog
				open={selectedRegion}
				onClose={() => this.setState({ selectedRegion: null })}
			>
				<DialogTitle>{regionData[selectedRegion].desc}</DialogTitle>
				<DialogContent>
					<CopyToClipboard text={`${baseCommand} ${selectedRegion}`}
						onCopy={() => this.setState({ selectedRegion: null })}>
						<Button color="primary">
							Copy console command
                        </Button>
					</CopyToClipboard>
				</DialogContent>
				<DialogActions>
				</DialogActions>
			</Dialog>
		);
	}

	render() {
		const { loading, error, selectedRegion, regionData } = this.state;

		return (
			<div className="app">
				{error && this.getErrorModal()}
				{loading && this.getLoadingDialog()}
				{selectedRegion && this.getSelecRegionDialog()}

				{!loading && !error &&
					<ComposableMap
						projectionConfig={{ scale: 205 }}
						width={980}
						height={551}
						style={{
							width: "100%",
							height: "auto",
						}}
					>
						<ZoomableGroup center={[0, 20]} disablePanning>
							<Geographies geography={worldMap}>
								{(geographies, projection) =>
									geographies.map((geography, i) =>
										geography.id !== "ATA" && (
											<Geography
												key={i}
												geography={geography}
												projection={projection}
												style={{
													default: {
														fill: "#8e8e8e",
														stroke: "#595959",
														strokeWidth: 0.75,
														outline: "none",
													},
													hover: {
														fill: "#8e8e8e",
														stroke: "#595959",
														strokeWidth: 0.75,
														outline: "none",
													},
													pressed: {
														fill: "#ECEFF1",
														stroke: "#607D8B",
														strokeWidth: 0.75,
														outline: "none",
													},
												}
												} />
										)
									)}
							</Geographies>
							{!loading &&
								<Markers>
									{Object.keys(regionData).map((region, i) => {
										const regionInfo = regionData[region];

										if (!regionInfo.geo || !regionInfo.desc) {
											return null;
										}

										for (let correctedMarker of correctedMarkers) {
											if (correctedMarker.id === region) {
												regionInfo.geo = correctedMarker.coordinates;
											}
										}

										return (
											<Marker
												key={i}
												marker={{
													markerOffset: -10,
													name: regionInfo.desc,
													coordinates: regionInfo.geo,
												}}
												onClick={() => this.setState({ selectedRegion: region })}
												style={{
													default: { fill: "#FF5722" },
													hover: { fill: "#ffffff" },
													pressed: { fill: "#ffffff" },
												}}
											>
												<circle
													cx={0}
													cy={0}
													r={1}
													style={{
														stroke: "#FF5722",
														strokeWidth: 4,
														opacity: 0.9,
													}}
												/>
											</Marker>
										);
									})}
								</Markers>
							}
						</ZoomableGroup>
					</ComposableMap>
				}
			</div>
		);
	}
}
