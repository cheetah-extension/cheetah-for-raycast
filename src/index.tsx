import {
  ActionPanel,
  CopyToClipboardAction,
  List,
  OpenInBrowserAction,
  showToast,
  ToastStyle,
  // popToRoot,
  PushAction,
  clearSearchBar,
  Detail,
} from "@raycast/api";
import { useState, useEffect, useRef } from "react";
import { filterWithCache, filterWithSearchResult } from './lib/utils';
import { Project } from './lib/type';

export default function Command() {
  return searchProject();
}

function SearchListItem({ searchResult }: { searchResult: Project }) {
  return (
    <List.Item
      title={searchResult.name}
      subtitle={searchResult.path}
      accessoryTitle={searchResult.type}
      icon={{
        source: `../assets/type/${searchResult.type}.png`,
      }}
      actions={
        <ActionPanel>
          <ActionPanel.Section>
            <OpenInBrowserAction title="Open in IDE" url={searchResult.path} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <PushAction title="Ignore the cache and search again" target={<Research />} shortcut={{ modifiers: ["cmd"], key: "r" }} />
          </ActionPanel.Section>
          <ActionPanel.Section>
            <CopyToClipboardAction
              title="Copy Project Real Path"
              content={`${searchResult.path}`}
              shortcut={{ modifiers: ["cmd"], key: "." }}
            />
          </ActionPanel.Section>
        </ActionPanel>
      }
    />
  );
}

function searchProject(keyword = '') {
  const { state, search } = useSearch(keyword);

  return (
    <List isLoading={state.isLoading} onSearchTextChange={search} searchBarPlaceholder="Search by name..." throttle>
      <List.Section title="Results" subtitle={state.results.length + ""}>
        {state.results.map((searchResult) => (
          <SearchListItem key={searchResult.id} searchResult={searchResult} />
        ))}
      </List.Section>
    </List>
  );
}

function useSearch(keyword = '') {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true, keyword: keyword });

  useEffect(() => {
    search(state.keyword);
  }, []);

  async function search(searchText: string) {
    try {
      setState((oldState) => ({
        ...oldState,
        isLoading: true,
      }));

      const results = await performSearch(searchText);
      setState((oldState) => ({
        ...oldState,
        results: results,
        isLoading: false,
      }));
    } catch (error) {
      console.error("search error", error);
      showToast(ToastStyle.Failure, "Could not perform search", String(error));
    }
  }

  return {
    state: state,
    search: search,
  };
}

function Research() {
  return searchProject('nuxt');
}

async function performSearch(searchText: string): Promise<Project[]> {
  let result: Project[] = await filterWithCache(searchText);
  // let fromCache = true;
  // ??????????????????????????????????????????????????????????????????
  if (!result.length) {
    result = await filterWithSearchResult(searchText);
    // fromCache = false;
  }
  // ??????????????????????????????????????????????????????????????????
  // if (fromCache) {
  //   result.push({
  //     title: '????????????????????????',
  //     subtitle: '??????????????????????????????,????????????????????????????????????????????????',
  //     arg: keyword,
  //     valid: true,
  //     icon: {
  //       path: 'assets/refresh.png',
  //     },
  //   });
  // }
  // if (!result.length) {
  //   result.push({
  //     title: `???????????????????????? ${keyword} ?????????`,
  //     subtitle: '????????????????????????',
  //     arg: keyword,
  //     valid: false,
  //     icon: {
  //       path: 'assets/empty.png',
  //     },
  //   });
  // }

  return result;
}

interface SearchState {
  results: Project[];
  isLoading: boolean;
  keyword: string;
}