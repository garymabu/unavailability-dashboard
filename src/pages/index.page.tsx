import HierarchicalNetwork from '@base/components/HierarchicalNetwork';
import { NodeData } from '@base/components/HierarchicalNetwork/interface';
import { ServiceAvailabilityResponse } from '@base/interface/integration/service/serviceAvailability.interface';
import ServiceAvailabilityService from '@base/services/api/serviceAvailability.service';
import { deepRemoveUndefinedProperties } from '@base/utils/objectManipulation.utils';

interface Props {
  data: NodeData[];
}

export const getServerSideProps = async () => {
  const rawResponse = await fetch(
    `${process.env.BASE_API}/serviceAvailability`
  );
  const { data: responseData } =
    (await rawResponse.json()) as ServiceAvailabilityResponse;

  const nodes =
    ServiceAvailabilityService.groupServiceDependenciesIntoNodes(responseData);
  const nodesWithColor =
    ServiceAvailabilityService.colorUpstreamNodesBasedOnHierarchy(nodes);

  const data = nodesWithColor.map(deepRemoveUndefinedProperties);

  return {
    props: {
      data,
    } as Props,
  };
};

export default function UnavailabilityDashboard({ data }: Props) {
  return (
    <main className="flex min-h-screen flex-col items-center text-center justify-between p-8">
      <section>
        <div>
          <h1 className="text-2xl font-bold">
            Monitoramento de Dependências Cloud
          </h1>
          <div>
            <HierarchicalNetwork data={data} height={1000} width={1000} />
          </div>
        </div>
      </section>
    </main>
  );
}
