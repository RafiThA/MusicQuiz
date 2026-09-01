import '../styles/components/Spinner.css';

function Spinner() {

	return (
		<div className="loading-wave">
			<div className="loading-bar" />
			<div className="loading-bar" />
			<div className="loading-bar" />
			<div className="loading-bar" />
		</div>
	);
}

export default Spinner;
