- dependencies
	mix.exs

- fetch dependencies
	> mix deps.get

- build app (navigate to app folder)
	> mix compile

- run app (navigate to app folder)
	> mix run --no-halt
	
- debug app (navigate to app folder)
	> iex.bat -S mix
	insert pry breakpoint inside code
		require IEx
		IEx.pry()