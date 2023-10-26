import React from "react";
import { PersonSchema } from "../types/person.dto";
import { useDB } from "./db";
import { ulid } from "ulidx";

interface PeopleContextInterface {
  list: () => Promise<PersonSchema[]>;
  create: () => Promise<string>;
  get: (planId: string) => Promise<PersonSchema | null>;
  save: (plan: PersonSchema) => Promise<void>;
  remove: (planId: string) => Promise<void>;
  people: PersonSchema[];
}

const PeopleContext = React.createContext<PeopleContextInterface>({
  list: async () => [],
  create: async () => '',
  get: async () => null,
  save: async () => { },
  remove: async () => { },
  people: [],
});

export const usePeople = () => React.useContext(PeopleContext);

export const WithPeople = ({ children }: { children: React.ReactNode }) => {
  const { db } = useDB();
  const [people, setPeople] = React.useState<PersonSchema[]>([]);

  const list = React.useCallback(async () => {
    const result = (await db?.getAll('people')) ?? [];
    setPeople(result);
    return result as Array<PersonSchema>;
  }, [db]);

  const create = async () => {
    const personId = ulid();

    const newPlan = {
      id: personId,
      name: "Robert Pulson",
      expenses: [],
    } as PersonSchema;

    await db?.add('people', newPlan);

    await list();

    return personId;
  };

  const remove = React.useCallback(async (planId: string) => {
    await db?.delete('people', planId);
    await list();
  }, [db, list]);

  const get = React.useCallback(async (planId: string) => db?.get('people', planId), [db]);
  const save = React.useCallback(async (plan: PersonSchema) => { await db?.put('people', plan); await list(); }, [db, list]);

  React.useEffect(() => {
    list();
  }, [list]);

  return (
    <PeopleContext.Provider value={{ list, create, get, save, remove, people }}>
      {children}
    </PeopleContext.Provider>
  );
}