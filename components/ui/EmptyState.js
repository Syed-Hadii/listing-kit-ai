export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-12 flex flex-col items-center text-center">
      {Icon && (
        <div className="w-14 h-14 rounded-2xl bg-brand-gold/10 text-brand-gold flex items-center justify-center mb-4">
          <Icon size={26} />
        </div>
      )}
      <h3 className="text-lg font-bold text-brand-navy">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-brand-navy/60 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
