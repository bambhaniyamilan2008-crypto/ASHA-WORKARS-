import QuickActions from '../QuickActions';

export default function QuickActionsExample() {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4 text-center">Quick Actions</h3>
      <QuickActions
        onAddFamily={() => console.log('Add family clicked')}
        onAddPatient={() => console.log('Add patient clicked')}
        onScanQR={() => console.log('Scan QR clicked')}
      />
    </div>
  );
}