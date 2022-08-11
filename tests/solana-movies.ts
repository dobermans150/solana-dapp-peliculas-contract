import * as anchor from "@project-serum/anchor";
import { Program } from "@project-serum/anchor";

import { TextEncoder } from 'util';
import assert from 'assert';

import { SolanaMovies } from "../target/types/solana_movies";

const { SystemProgram, PublicKey } = anchor.web3

const stringToBytes = (input: string): Uint8Array => {
  return new TextEncoder().encode(input);
}

function assertNotNull<T>(v: T | null): T {
  assert(v !== null);
  return v!;
}

describe("solana-movies", () => {
  // Configure the client to use the local cluster.

  const gifUrl = "https://test.com";

  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.SolanaMovies as Program<SolanaMovies>;



  it("Is initialized!", async () => {

    const [pda] = await PublicKey.findProgramAddress(
      [
        stringToBytes("gif_account"),
        anchor.getProvider().publicKey.toBytes(),
        stringToBytes(gifUrl),
      ],
      program.programId
    );

    let tx = await program.methods.initialize(gifUrl).accounts({
      movieGif: pda,
      user: anchor.getProvider().publicKey,
      systemProgram: SystemProgram.programId,
    }).rpc();

    assertNotNull(tx);

    // Add your test here.
    // const tx = await program.methods.initialize().rpc();
    //console.log("Your transaction signature", tx);
  });

  it("Get all movies", async () => {
    const gifsByOwner = await program.account.movieGif.all();

    assert.equal(1, gifsByOwner.length);
  })

  it("Finds movies by pubkey!", async () => {
    const gifsByOwner = await program.account.movieGif.all([
      {
        memcmp: {
          bytes: anchor.getProvider().publicKey.toBase58(),
          offset: 8,
        }
      }
    ]);

    assert.equal(1, gifsByOwner.length);

  })
});
