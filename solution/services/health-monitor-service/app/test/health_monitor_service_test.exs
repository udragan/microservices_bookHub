defmodule HealthMonitorServiceTest do
  use ExUnit.Case
  doctest HealthMonitorService

  test "greets the world" do
    assert HealthMonitorService.hello() == :world
  end
end
