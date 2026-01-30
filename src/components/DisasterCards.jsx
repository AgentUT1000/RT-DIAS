const Card = ({ title, location, v1, v2, onClick }) => {
    return (
        <div className="card-wrapper" onClick={onClick} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
            <div className="card-glow"></div>
            <div className="card">
                <div className="card-header">
                    {title} <span className="separator">|</span> <span className="location">{location}</span>
                </div>

                <div className="card-values">
                    <span>{v1}</span>
                    <span>{v2}</span>
                </div>
            </div>
        </div>
    );
};

export const DisasterCards = ({ onSelect }) => {
    return (
        <div className="cards-container">
            <Card
                title="Landslide"
                location="Uttarakhand"
                v1="255.33"
                v2="1046.23"
                onClick={() => onSelect({ type: 'Landslide', location: 'Uttarakhand' })}
            />
            <Card
                title="EarthQuake"
                location="Delhi"
                v1="255.33"
                v2="1046.23"
                onClick={() => onSelect({ type: 'EarthQuake', location: 'Delhi' })}
            />
        </div>
    );
};
