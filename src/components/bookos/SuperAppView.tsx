import { getSuperApp, getSuperAppId } from './superapps';

interface SuperAppViewProps {
  appId: string;
  onClose: () => void;
}

export function SuperAppView({ appId, onClose }: SuperAppViewProps) {
  const superAppId = getSuperAppId(appId);
  const superApp = getSuperApp(superAppId);

  if (!superApp) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>Super app non trouvée: {superAppId}</p>
      </div>
    );
  }

  const Component = superApp.component;
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Component onClose={onClose} />
    </div>
  );
}
