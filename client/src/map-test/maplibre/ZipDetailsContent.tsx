import { ZipDetailsError } from "./ZipDetailsError";

const ContentContainer = ({ children }: React.PropsWithChildren) => {
  return (
    <div className="flex flex-col h-full w-full items-center justify-center justify-self-center text-center gap-[32px]">
      {children}
    </div>
  );
};

export const ZipDetailsContent = ({ zipData }: { zipData: unknown }) => {
  if (!zipData) {
    return (
      <ContentContainer>
        <ZipDetailsError />
      </ContentContainer>
    );
  }

  // return <>{`${zipData}`}</>;
};
