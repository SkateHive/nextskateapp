import { GIPHY_API_KEY } from "@/lib/constants";
import {
  Center,
  Input,
  InputGroup,
  InputRightElement,
  Spinner,
} from "@chakra-ui/react";
import { GifsResult, GiphyFetch } from "@giphy/js-fetch-api";
import { IGif } from "@giphy/js-types";
import { Grid } from "@giphy/react-components";
import React, { useEffect, useState } from "react";
import { FaSearch } from "react-icons/fa";

interface GiphySelectorProps {
  onSelect: (gif: IGif, e: React.SyntheticEvent<HTMLElement>) => void;
}

const GiphySelector: React.FC<GiphySelectorProps> = ({ onSelect }) => {
  const gf = new GiphyFetch(GIPHY_API_KEY);

  const [searchTerm, setSearchTerm] = useState("skateboard funny");
  const [isLoading, setIsLoading] = useState(false);
  const [key, setKey] = useState(0);

  const fetchGifs = async (offset: number): Promise<GifsResult> => {
    setIsLoading(true);
    const result = searchTerm
      ? await gf.search(searchTerm, { offset, limit: 10 })
      : await gf.trending({ offset, limit: 10 });
    setIsLoading(false);
    return result;
  };

  const handleSearchTermChange = (value: string) => {
    setSearchTerm(value);
  };

  const handleSearchIconClick = () => {
    fetchGifs(0);
    setKey(key + 1);
  };

  const handleGifClick = (gif: IGif, e: React.SyntheticEvent<HTMLElement>) => {
    onSelect(gif, e);
  };

  useEffect(() => {
    fetchGifs(0);
    setKey(key + 1);
  }, [searchTerm]);

  return (
    <>
      <InputGroup>
        <InputRightElement>
          {isLoading ? (
            <Spinner />
          ) : (
            <FaSearch cursor="pointer" onClick={handleSearchIconClick} />
          )}
        </InputRightElement>
        <Input
          pr="4.5rem"
          placeholder="Type to search..."
          value={searchTerm}
          onChange={(e) => handleSearchTermChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              fetchGifs(0);
              setKey(key + 1);
            }
          }}
        />
      </InputGroup>
      <Center mt={4}>
        <Grid
          key={key}
          width={450}
          columns={3}
          fetchGifs={fetchGifs}
          onGifClick={handleGifClick}
        />
      </Center>
    </>
  );
};

export default GiphySelector;
