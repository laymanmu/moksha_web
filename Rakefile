
task :default => :test

desc "Test all the things!"
task :test do
  sh "nodeunit tests/test_*.js"
end

desc "create a single file version"
task :to_single_file do
  app    = "moksha"
  html   = File.readlines("#{app}.html").reject { |line| line =~ /^\s+$/ }
  css    = File.readlines("#{app}.css").reject  { |line| line =~ /^\s+$/ }
  output = File.open("single_file.html", "wb")

  html.each do |html_line|
    if html_line =~ /^(\s*).*#{app}\.css/
      space = $1
      output.write(space +'<style type="text/css">'+ "\n")
      css.each do |css_line|
        output.write(space +"  "+ css_line)
      end
      output.write(space +'</style>'+ "\n")
    elsif html_line =~ /^(\s*)<script.*src=['"](.*\.js)/
      space  = $1
      jsfile = $2
      jscode = File.readlines(jsfile).reject {|line| line =~ /^\s+$/ }
      output.write(space + "<!-- #{jsfile}: -->\n")
      output.write(space +'<script type="text/javascript">'+ "\n")
      jscode.each do |jsline|
        output.write(space +"  "+ jsline)
      end
      output.write(space +'</script>'+ "\n")
    else
      output.write(html_line)
    end
  end
  output.close
end

