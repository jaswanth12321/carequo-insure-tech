export const TrustBadge = ({ icon, title, subtitle, color = "blue", rating }) => {
  const colorClasses = {
    green: "border-green-500 bg-gradient-to-br from-green-50 to-emerald-50",
    orange: "border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50",
    blue: "border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50",
    purple: "border-purple-500 bg-gradient-to-br from-purple-50 to-violet-50",
    indigo: "border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50"
  };

  return (
    <div className={`trust-seal ${colorClasses[color]} border-${color}-500`}>
      <div className="flex items-center gap-3">
        <div className="text-4xl">{icon}</div>
        <div className="flex flex-col">
          {rating && (
            <div className="flex items-center gap-1 mb-1">
              <span className={`text-${color}-600 font-bold text-base`}>{rating}</span>
            </div>
          )}
          <span className={`text-${color}-900 font-bold text-sm leading-tight`}>{title}</span>
          <span className="text-gray-600 text-xs mt-0.5">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export const AwardBadge = ({ icon, title, subtitle }) => {
  return (
    <div className="premium-badge">
      <div className="flex items-center gap-3">
        <div className="text-3xl">{icon}</div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-gray-900 leading-tight">{title}</span>
          <span className="text-xs text-gray-600 mt-0.5">{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export const SecurityBadge = ({ icon, text }) => {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
      <span className="text-green-600 font-bold">{icon}</span>
      <span className="text-sm font-semibold text-gray-700">{text}</span>
    </div>
  );
};
