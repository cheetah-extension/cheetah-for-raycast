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
  return search();
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
            <PushAction title="重新搜索" target={<Research />} shortcut={{ modifiers: ["cmd"], key: "r" }} />
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

function search() {
  const { state, search } = useSearch();

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

function useSearch() {
  const [state, setState] = useState<SearchState>({ results: [], isLoading: true });

  useEffect(() => {
    search("");
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
  return search();
}

async function performSearch(searchText: string): Promise<Project[]> {
  let result: Project[] = await filterWithCache(searchText);
  // let fromCache = true;
  // 如果缓存结果为空或者需要刷新缓存，则重新搜索
  if (!result.length) {
    result = await filterWithSearchResult(searchText);
    // fromCache = false;
  }
  // 如果是从缓存中获取的内容，最后加上刷新的入口
  // if (fromCache) {
  //   result.push({
  //     title: '忽略缓存重新搜索',
  //     subtitle: '以上结果从缓存中获得,选择本条将重新搜索项目并更新缓存',
  //     arg: keyword,
  //     valid: true,
  //     icon: {
  //       path: 'assets/refresh.png',
  //     },
  //   });
  // }
  // if (!result.length) {
  //   result.push({
  //     title: `没有找到名称包含 ${keyword} 的项目`,
  //     subtitle: '请尝试更换关键词',
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
}